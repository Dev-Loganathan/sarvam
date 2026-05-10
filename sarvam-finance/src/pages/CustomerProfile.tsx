import { useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ChevronLeft, Edit2, UserX, UserCheck, Phone, Mail, MapPin, Calendar,
  FileText, Download, Plus, Trash2, History,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCustomers } from "@/hooks/use-customers";
import { CategoryBadge, CibilScore, RiskBadge } from "@/components/customer/RiskBadge";
import { DocumentUpload } from "@/components/customer/DocumentUpload";
import { InactiveDialog } from "@/components/customer/InactiveDialog";
import {
  useCustomer,
  useUpdateCustomerStatus,
  useAddNote,
  useAddDocument,
  useRemoveDocument
} from "@/hooks/use-customers";
import { CustomerDocument, DocumentType, DOCUMENT_LABELS, INACTIVE_REASON_LABELS } from "@/lib/customer-types";
import { cn } from "@/lib/utils";
import { loans } from "@/lib/mock-data";

export default function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: customer, isLoading } = useCustomer(id);
  const { mutate: updateStatus } = useUpdateCustomerStatus();
  const { mutate: addNoteMutate } = useAddNote();
  const { mutate: addDocMutate } = useAddDocument();
  const { mutate: removeDocMutate } = useRemoveDocument();
  
  const [showInactive, setShowInactive] = useState(false);
  const [noteText, setNoteText] = useState("");
  const tab = searchParams.get("tab") ?? "personal";

  const notes = customer?.notes ?? [];
  const audit = customer?.auditLogs ?? [];

  if (isLoading) {
    return <div className="text-center py-16 text-muted-foreground">Loading profile...</div>;
  }

  if (!customer) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Customer not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/customers")}>
          Back to Customers
        </Button>
      </div>
    );
  }

  const fullName = `${customer.firstName} ${customer.lastName ?? ""}`.trim();
  const initials = `${customer.firstName[0] ?? ""}${customer.lastName?.[0] ?? ""}`.toUpperCase();
  const income = customer.monthlySalary + (customer.additionalIncome ?? 0);
  const customerLoans = loans.filter((l) => l.customerName.toLowerCase().includes(customer.firstName.toLowerCase()));

  const handleAddNote = () => {
    if (!noteText.trim() || !customer) return;
    addNoteMutate({ id: customer.id, note: noteText.trim() }, {
      onSuccess: () => {
        setNoteText("");
        toast({ title: "Note added" });
      }
    });
  };

  const handleSetDoc = (type: DocumentType, doc?: CustomerDocument) => {
    if (!customer) return;
    const existing = customer.documents.find((d: any) => d.type === type);
    if (existing) removeDocMutate({ id: customer.id, docId: existing.id });
    if (doc) addDocMutate({ id: customer.id, data: doc });
  };
  const getDoc = (type: DocumentType) => customer?.documents?.find((d: any) => d.type === type);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/customers")} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
      </div>

      {/* Header card */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-start gap-5 flex-wrap">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary overflow-hidden shrink-0">
            {customer.photoDataUrl ? (
              <img src={customer.photoDataUrl} alt={fullName} className="w-full h-full object-cover" />
            ) : initials}
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{fullName}</h1>
              <Badge variant="outline" className="font-mono">{customer.customerCode}</Badge>
              <Badge
                variant="outline"
                className={cn(
                  "capitalize",
                  customer.status === "active"
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {customer.status}
              </Badge>
              <RiskBadge level={customer.riskLevel} />
              <CategoryBadge category={customer.category} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {customer.mobile}</span>
              {customer.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {customer.email}</span>}
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {customer.city}, {customer.state}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Joined {new Date(customer.createdAt).toLocaleDateString("en-IN")}</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={() => navigate(`/customers/${customer.id}/edit`)} className="gap-2">
              <Edit2 className="w-4 h-4" /> Edit
            </Button>
            {customer.status === "active" ? (
              <Button variant="outline" onClick={() => setShowInactive(true)} className="gap-2 text-destructive">
                <UserX className="w-4 h-4" /> Mark Inactive
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  updateStatus({ id: customer.id, status: "active" }, {
                    onSuccess: () => toast({ title: "Reactivated" })
                  });
                }}
                className="gap-2 text-success"
              >
                <UserCheck className="w-4 h-4" /> Reactivate
              </Button>
            )}
          </div>
        </div>

        {customer.status === "inactive" && customer.inactiveReason && (
          <div className="mt-4 p-3 rounded-lg bg-muted text-sm">
            <strong>Inactive:</strong> {INACTIVE_REASON_LABELS[customer.inactiveReason]}
            {customer.inactiveNote && <> — {customer.inactiveNote}</>}
            {customer.inactiveAt && (
              <span className="text-muted-foreground"> · {new Date(customer.inactiveAt).toLocaleString("en-IN")}</span>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={(v) => setSearchParams({ tab: v })}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="documents">KYC</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="chits">Chits</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="audit">Audit</TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="bg-card rounded-xl border border-border p-6 space-y-6 mt-4">
          <Section title="Basic Details">
            <Field label="Full Name" value={fullName} />
            <Field label="Gender" value={customer.gender} className="capitalize" />
            <Field label="Date of Birth" value={new Date(customer.dob).toLocaleDateString("en-IN")} />
            <Field label="Marital Status" value={customer.maritalStatus} className="capitalize" />
            <Field label="Mobile" value={customer.mobile} />
            <Field label="Alternate Mobile" value={customer.altMobile ?? "—"} />
            <Field label="Email" value={customer.email ?? "—"} />
          </Section>
          <Section title="Address">
            <Field label="Current Address" value={customer.currentAddress} wide />
            <Field label="Permanent Address" value={customer.permanentAddress} wide />
            <Field label="City" value={customer.city} />
            <Field label="State" value={customer.state} />
            <Field label="Pincode" value={customer.pincode} />
            <Field label="Landmark" value={customer.landmark ?? "—"} />
            <Field label="Residence Type" value={customer.residenceType} className="capitalize" />
          </Section>
          <Section title="Family & References">
            <Field label="Father" value={customer.fatherName} />
            <Field label="Mother" value={customer.motherName} />
            <Field label="Spouse" value={customer.spouseName ?? "—"} />
            <Field label="Nominee" value={`${customer.nomineeName} (${customer.nomineeRelation})`} />
            <Field label="Reference 1" value={`${customer.reference1Name} · ${customer.reference1Mobile}`} />
            <Field label="Reference 2" value={customer.reference2Name ? `${customer.reference2Name} · ${customer.reference2Mobile}` : "—"} />
          </Section>
        </TabsContent>

        <TabsContent value="documents" className="bg-card rounded-xl border border-border p-6 mt-4 space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-1">KYC Identifiers</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
              <Field label="Aadhaar" value={customer.aadhaarNumber} />
              <Field label="PAN" value={customer.panNumber} />
              <Field label="Voter ID" value={customer.voterId ?? "—"} />
              <Field label="Driving License" value={customer.drivingLicense ?? "—"} />
              <Field label="Passport" value={customer.passport ?? "—"} />
            </div>
          </div>
          <div className="border-t border-border pt-5">
            <h3 className="text-sm font-semibold mb-3">Uploaded Documents</h3>
            {customer.documents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {customer.documents.map((d: any) => (
                  <DocumentCard key={d.id} doc={d} onDelete={() => removeDocMutate({ id: customer.id, docId: d.id })} />
                ))}
              </div>
            )}
            <h4 className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Add / Replace</h4>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(["aadhaar_front","aadhaar_back","pan_card","selfie","signature","address_proof","additional"] as DocumentType[]).map((t) => (
                <DocumentUpload key={t} type={t} value={getDoc(t)} onChange={(d) => handleSetDoc(t, d)} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="bg-card rounded-xl border border-border p-6 mt-4 space-y-6">
          <Section title="Employment">
            <Field label="Occupation" value={customer.occupationType} />
            <Field label="Company" value={customer.companyName ?? "—"} />
            <Field label="Designation" value={customer.designation ?? "—"} />
            <Field label="Experience" value={customer.workExperience ?? "—"} />
            <Field label="Business" value={customer.businessName ?? "—"} />
          </Section>
          <Section title="Income & Liabilities">
            <Field label="Monthly Salary" value={`₹${customer.monthlySalary.toLocaleString("en-IN")}`} />
            <Field label="Additional Income" value={`₹${(customer.additionalIncome ?? 0).toLocaleString("en-IN")}`} />
            <Field label="Total Income" value={`₹${income.toLocaleString("en-IN")}`} />
            <Field label="Existing Loans" value={String(customer.existingLoans)} />
            <Field label="Monthly EMI" value={`₹${customer.monthlyEmi.toLocaleString("en-IN")}`} />
            <Field label="Debt-to-Income" value={`${income > 0 ? ((customer.monthlyEmi / income) * 100).toFixed(1) : 0}%`} />
          </Section>
          <Section title="Bank">
            <Field label="Bank Name" value={customer.bankName} />
            <Field label="Account Number" value={customer.accountNumber} />
            <Field label="IFSC" value={customer.ifscCode} />
          </Section>
          <Section title="Credit">
            <div>
              <p className="text-xs text-muted-foreground">CIBIL Score</p>
              <p className="text-xl mt-1"><CibilScore score={customer.cibilScore} /></p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Risk Level</p>
              <RiskBadge level={customer.riskLevel} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Category</p>
              <CategoryBadge category={customer.category} />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="loans" className="bg-card rounded-xl border border-border p-6 mt-4">
          {customerLoans.length === 0 ? (
            <EmptyTab text="No loans linked yet" />
          ) : (
            <div className="space-y-2">
              {customerLoans.map((l) => (
                <div key={l.id} className="p-3 rounded-lg border border-border flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-medium text-sm">{l.type} · {l.id}</p>
                    <p className="text-xs text-muted-foreground">EMI ₹{l.emi.toLocaleString("en-IN")} · {l.paid}/{l.duration} paid</p>
                  </div>
                  <Badge variant={l.status === "active" ? "default" : "destructive"}>{l.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="chits" className="bg-card rounded-xl border border-border p-6 mt-4">
          <EmptyTab text="No chit groups joined yet" />
        </TabsContent>

        <TabsContent value="payments" className="bg-card rounded-xl border border-border p-6 mt-4">
          <EmptyTab text="No payment history yet" />
        </TabsContent>

        <TabsContent value="notes" className="bg-card rounded-xl border border-border p-6 mt-4 space-y-4">
          <div className="space-y-2">
            <Textarea
              rows={3}
              placeholder="Add an internal note about this customer..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
            />
            <Button onClick={handleAddNote} className="gap-2" size="sm">
              <Plus className="w-4 h-4" /> Add Note
            </Button>
          </div>
          <div className="space-y-3">
            {notes.length === 0 ? (
              <EmptyTab text="No notes yet" />
            ) : notes.map((n) => (
              <div key={n.id} className="p-3 rounded-lg bg-secondary/50 border border-border">
                <p className="text-sm whitespace-pre-wrap">{n.note}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {n.createdBy} · {new Date(n.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="audit" className="bg-card rounded-xl border border-border p-6 mt-4">
          {audit.length === 0 ? (
            <EmptyTab text="No audit history" />
          ) : (
            <ul className="space-y-3">
              {audit.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                    <History className="w-3.5 h-3.5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.action}</p>
                    {a.details && <p className="text-xs text-muted-foreground">{a.details}</p>}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {a.user} · {new Date(a.createdAt).toLocaleString("en-IN")}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </TabsContent>
      </Tabs>

      <InactiveDialog
        customerId={customer.id}
        customerName={fullName}
        open={showInactive}
        onOpenChange={setShowInactive}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value, wide, className }: { label: string; value: string; wide?: boolean; className?: string }) {
  return (
    <div className={cn(wide && "sm:col-span-2 lg:col-span-3")}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm font-medium mt-0.5 break-words", className)}>{value}</p>
    </div>
  );
}

function EmptyTab({ text }: { text: string }) {
  return <p className="text-sm text-muted-foreground text-center py-8">{text}</p>;
}

function DocumentCard({ doc, onDelete }: { doc: CustomerDocument; onDelete: () => void }) {
  const isImage = doc.mimeType.startsWith("image/");
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden group">
      <div className="aspect-video bg-secondary flex items-center justify-center overflow-hidden">
        {isImage ? (
          <img src={doc.dataUrl} alt={doc.name} className="w-full h-full object-cover" />
        ) : (
          <FileText className="w-10 h-10 text-muted-foreground" />
        )}
      </div>
      <div className="p-3">
        <p className="text-xs font-semibold">{DOCUMENT_LABELS[doc.type]}</p>
        <p className="text-xs text-muted-foreground truncate">{doc.name}</p>
        <div className="flex gap-1 mt-2">
          <a
            href={doc.dataUrl}
            download={doc.name}
            className="flex-1 inline-flex items-center justify-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-secondary"
          >
            <Download className="w-3 h-3" /> Download
          </a>
          <button
            onClick={onDelete}
            className="px-2 py-1 rounded-md border border-border hover:bg-destructive/10 text-destructive"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
