import {
  AuditEntry,
  Customer,
  CustomerCategory,
  CustomerDocument,
  CustomerNote,
  InactiveReason,
  RiskLevel,
} from "./customer-types";

const CUSTOMERS_KEY = "fh:customers";
const NOTES_KEY = "fh:customer_notes";
const AUDIT_KEY = "fh:audit_logs";
const COUNTER_KEY = "fh:customer_counter";

const DEFAULT_USER = "Admin";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeCustomers(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getCustomers(): Customer[] {
  return read<Customer[]>(CUSTOMERS_KEY, []);
}

export function getCustomer(id: string): Customer | undefined {
  return getCustomers().find((c) => c.id === id);
}

function nextCustomerCode(): string {
  const current = read<number>(COUNTER_KEY, 1000);
  const next = current + 1;
  write(COUNTER_KEY, next);
  return `CUS${String(next).padStart(4, "0")}`;
}

export function calculateRisk(
  cibilScore: number,
  monthlyIncome: number,
  monthlyEmi: number
): { risk: RiskLevel; category: CustomerCategory } {
  const dti = monthlyIncome > 0 ? monthlyEmi / monthlyIncome : 1;
  let score = 0;
  if (cibilScore >= 750) score += 3;
  else if (cibilScore >= 700) score += 2;
  else if (cibilScore >= 650) score += 1;

  if (dti < 0.3) score += 2;
  else if (dti < 0.5) score += 1;

  let risk: RiskLevel;
  if (score >= 4) risk = "low";
  else if (score === 3) risk = "medium";
  else if (score === 2) risk = "high";
  else risk = "very_high";

  let category: CustomerCategory;
  if (cibilScore >= 780) category = "excellent";
  else if (cibilScore >= 720) category = "good";
  else if (cibilScore >= 650) category = "medium";
  else category = "risky";

  return { risk, category };
}

function logAudit(customerId: string, action: string, details?: string) {
  const list = read<AuditEntry[]>(AUDIT_KEY, []);
  list.unshift({
    id: crypto.randomUUID(),
    customerId,
    action,
    details,
    user: DEFAULT_USER,
    createdAt: new Date().toISOString(),
  });
  write(AUDIT_KEY, list);
}

export function getAuditLogs(customerId: string): AuditEntry[] {
  return read<AuditEntry[]>(AUDIT_KEY, []).filter(
    (e) => e.customerId === customerId
  );
}

export type CustomerInput = Omit<
  Customer,
  | "id"
  | "customerCode"
  | "createdAt"
  | "updatedAt"
  | "status"
  | "riskLevel"
  | "category"
> & { riskLevel?: RiskLevel; category?: CustomerCategory };

export function createCustomer(input: CustomerInput): Customer {
  const { risk, category } = calculateRisk(
    input.cibilScore,
    input.monthlySalary + (input.additionalIncome ?? 0),
    input.monthlyEmi
  );
  const now = new Date().toISOString();
  const customer: Customer = {
    ...input,
    id: crypto.randomUUID(),
    customerCode: nextCustomerCode(),
    status: "active",
    riskLevel: risk,
    category,
    createdAt: now,
    updatedAt: now,
  };
  const list = getCustomers();
  list.unshift(customer);
  write(CUSTOMERS_KEY, list);
  logAudit(customer.id, "Created", `Onboarded ${customer.firstName}`);
  emit();
  return customer;
}

export function updateCustomer(id: string, updates: Partial<Customer>): Customer | undefined {
  const list = getCustomers();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return undefined;
  const merged = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
  const income = merged.monthlySalary + (merged.additionalIncome ?? 0);
  const calc = calculateRisk(merged.cibilScore, income, merged.monthlyEmi);
  merged.riskLevel = calc.risk;
  merged.category = calc.category;
  list[idx] = merged;
  write(CUSTOMERS_KEY, list);
  logAudit(id, "Updated", "Profile details edited");
  emit();
  return merged;
}

export function setCustomerStatus(
  id: string,
  status: "active" | "inactive",
  reason?: InactiveReason,
  note?: string
) {
  const list = getCustomers();
  const idx = list.findIndex((c) => c.id === id);
  if (idx === -1) return;
  list[idx] = {
    ...list[idx],
    status,
    inactiveReason: status === "inactive" ? reason : undefined,
    inactiveNote: status === "inactive" ? note : undefined,
    inactiveAt: status === "inactive" ? new Date().toISOString() : undefined,
    updatedAt: new Date().toISOString(),
  };
  write(CUSTOMERS_KEY, list);
  logAudit(id, status === "inactive" ? "Marked Inactive" : "Reactivated", note);
  emit();
}

export function deleteCustomer(id: string) {
  // Soft delete = mark inactive with reason "other"
  setCustomerStatus(id, "inactive", "other", "Soft deleted");
}

export function addDocument(customerId: string, doc: CustomerDocument) {
  const customer = getCustomer(customerId);
  if (!customer) return;
  const docs = [...customer.documents, doc];
  updateCustomer(customerId, { documents: docs });
}

export function removeDocument(customerId: string, docId: string) {
  const customer = getCustomer(customerId);
  if (!customer) return;
  updateCustomer(customerId, {
    documents: customer.documents.filter((d) => d.id !== docId),
  });
}

export function getNotes(customerId: string): CustomerNote[] {
  return read<CustomerNote[]>(NOTES_KEY, []).filter(
    (n) => n.customerId === customerId
  );
}

export function addNote(customerId: string, note: string) {
  const list = read<CustomerNote[]>(NOTES_KEY, []);
  const entry: CustomerNote = {
    id: crypto.randomUUID(),
    customerId,
    note,
    createdBy: DEFAULT_USER,
    createdAt: new Date().toISOString(),
  };
  list.unshift(entry);
  write(NOTES_KEY, list);
  logAudit(customerId, "Note added");
  emit();
  return entry;
}

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
