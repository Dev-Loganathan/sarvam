import { z } from "zod";

const phoneRegex = /^[6-9]\d{9}$/;
const aadhaarRegex = /^\d{12}$/;
const panRegex = /^[A-Z]{5}\d{4}[A-Z]$/;
const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const pincodeRegex = /^\d{6}$/;

export const step1Schema = z.object({
  firstName: z.string().trim().min(2, "Min 2 chars").max(50),
  lastName: z.string().trim().max(50).nullish().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]),
  dob: z.string().min(1, "Required").refine((d) => {
    const date = new Date(d);
    return !isNaN(date.getTime()) && date < new Date();
  }, "Invalid date"),
  mobile: z.string().regex(phoneRegex, "Invalid 10-digit mobile"),
  altMobile: z.union([z.string().regex(phoneRegex, "Invalid mobile"), z.literal(""), z.null(), z.undefined()]),
  email: z.union([z.string().email("Invalid email").max(255), z.literal(""), z.null(), z.undefined()]),
  maritalStatus: z.enum(["single", "married", "divorced", "widowed"]),
  photoDataUrl: z.string().nullish(),
});

export const step2Schema = z.object({
  currentAddress: z.string().trim().min(5, "Required").max(300),
  permanentAddress: z.string().trim().min(5, "Required").max(300),
  city: z.string().trim().min(2, "Required").max(80),
  state: z.string().trim().min(2, "Required").max(80),
  pincode: z.string().regex(pincodeRegex, "6-digit pincode"),
  landmark: z.string().trim().max(120).nullish().or(z.literal("")),
  residenceType: z.enum(["own", "rent", "family"]),
});

export const step3Schema = z.object({
  aadhaarNumber: z.string().regex(aadhaarRegex, "12-digit Aadhaar"),
  panNumber: z.string().regex(panRegex, "Invalid PAN (e.g. ABCDE1234F)"),
  voterId: z.string().trim().max(20).nullish().or(z.literal("")),
  drivingLicense: z.string().trim().max(20).nullish().or(z.literal("")),
  passport: z.string().trim().max(20).nullish().or(z.literal("")),
});

export const step4Schema = z.object({
  occupationType: z.string().trim().min(2, "Required"),
  companyName: z.string().trim().max(120).nullish().or(z.literal("")),
  designation: z.string().trim().max(80).nullish().or(z.literal("")),
  workExperience: z.string().trim().max(40).nullish().or(z.literal("")),
  monthlySalary: z.coerce.number().min(0, "Required").max(10000000),
  additionalIncome: z.coerce.number().min(0).max(10000000).nullish(),
  businessName: z.string().trim().max(120).nullish().or(z.literal("")),
  bankName: z.string().trim().min(2, "Required").max(80),
  accountNumber: z.string().trim().min(6, "Min 6 digits").max(20),
  ifscCode: z.string().regex(ifscRegex, "Invalid IFSC"),
});

export const step5Schema = z.object({
  fatherName: z.string().trim().min(2, "Required").max(80),
  motherName: z.string().trim().min(2, "Required").max(80),
  spouseName: z.string().trim().max(80).nullish().or(z.literal("")),
  nomineeName: z.string().trim().min(2, "Required").max(80),
  nomineeRelation: z.string().trim().min(2, "Required").max(40),
  reference1Name: z.string().trim().min(2, "Required").max(80),
  reference1Mobile: z.string().regex(phoneRegex, "Invalid mobile"),
  reference2Name: z.string().trim().max(80).nullish().or(z.literal("")),
  reference2Mobile: z.union([z.string().regex(phoneRegex, "Invalid mobile"), z.literal(""), z.null(), z.undefined()]),
});

export const step6Schema = z.object({
  cibilScore: z.coerce.number().min(300, "Min 300").max(900, "Max 900"),
  existingLoans: z.coerce.number().min(0).max(50),
  monthlyEmi: z.coerce.number().min(0).max(10000000),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type Step4Data = z.infer<typeof step4Schema>;
export type Step5Data = z.infer<typeof step5Schema>;
export type Step6Data = z.infer<typeof step6Schema>;
