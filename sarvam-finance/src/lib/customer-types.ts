export type Gender = "male" | "female" | "other";
export type MaritalStatus = "single" | "married" | "divorced" | "widowed";
export type ResidenceType = "own" | "rent" | "family";
export type CustomerStatus = "active" | "inactive";
export type RiskLevel = "low" | "medium" | "high" | "very_high";
export type CustomerCategory = "excellent" | "good" | "medium" | "risky";
export type InactiveReason =
  | "closed_account"
  | "not_interested"
  | "defaulted"
  | "duplicate"
  | "fraud_risk"
  | "other";

export type DocumentType =
  | "aadhaar_front"
  | "aadhaar_back"
  | "pan_card"
  | "selfie"
  | "signature"
  | "address_proof"
  | "voter_id"
  | "driving_license"
  | "passport"
  | "additional";

export interface CustomerDocument {
  id: string;
  type: DocumentType;
  name: string;
  mimeType: string;
  size: number;
  /** base64 data URL */
  dataUrl: string;
  uploadedAt: string;
}

export interface CustomerNote {
  id: string;
  customerId: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  customerId: string;
  action: string;
  details?: string;
  user: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  customerCode: string;
  // Step 1
  firstName: string;
  lastName?: string;
  gender: Gender;
  dob: string;
  mobile: string;
  altMobile?: string;
  email?: string;
  maritalStatus: MaritalStatus;
  photoDataUrl?: string;
  // Step 2
  currentAddress: string;
  permanentAddress: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  residenceType: ResidenceType;
  // Step 3
  aadhaarNumber: string;
  panNumber: string;
  voterId?: string;
  drivingLicense?: string;
  passport?: string;
  documents: CustomerDocument[];
  // Step 4
  occupationType: string;
  companyName?: string;
  designation?: string;
  workExperience?: string;
  monthlySalary: number;
  additionalIncome?: number;
  businessName?: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  // Step 5
  fatherName: string;
  motherName: string;
  spouseName?: string;
  nomineeName: string;
  nomineeRelation: string;
  reference1Name: string;
  reference1Mobile: string;
  reference2Name?: string;
  reference2Mobile?: string;
  // Step 6
  cibilScore: number;
  existingLoans: number;
  monthlyEmi: number;
  riskLevel: RiskLevel;
  category: CustomerCategory;
  // System
  status: CustomerStatus;
  inactiveReason?: InactiveReason;
  inactiveNote?: string;
  inactiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  aadhaar_front: "Aadhaar Front",
  aadhaar_back: "Aadhaar Back",
  pan_card: "PAN Card",
  selfie: "Selfie",
  signature: "Signature",
  address_proof: "Address Proof",
  voter_id: "Voter ID",
  driving_license: "Driving License",
  passport: "Passport",
  additional: "Additional Document",
};

export const INACTIVE_REASON_LABELS: Record<InactiveReason, string> = {
  closed_account: "Closed account",
  not_interested: "Not interested",
  defaulted: "Defaulted",
  duplicate: "Duplicate",
  fraud_risk: "Fraud risk",
  other: "Other",
};
