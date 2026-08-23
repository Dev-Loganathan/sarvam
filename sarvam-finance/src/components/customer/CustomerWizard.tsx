import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronLeft, ChevronRight, Save, Loader2 } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, step6Schema,
} from "@/lib/customer-schema";
import { calculateRisk, CustomerInput } from "@/lib/customer-store";
import { Customer, CustomerDocument, DocumentType } from "@/lib/customer-types";
import { DocumentUpload, PhotoUpload } from "./DocumentUpload";
import { DatePicker } from "@/components/global/DatePicker";
import { RiskBadge, CategoryBadge } from "./RiskBadge";
import { useCreateCustomer, useUpdateCustomer, useSaveCustomerDraft, useDeleteCustomerDraft } from "@/hooks/use-customers";
import { useCountries, useStates, useDistricts } from "@/hooks/use-location-masters";

const STEPS = [
  { id: 1, title: "Basic Details", desc: "Personal info" },
  { id: 2, title: "Address", desc: "Where they live" },
  { id: 3, title: "KYC & Documents", desc: "Identity proof" },
  { id: 4, title: "Employment", desc: "Income & bank" },
  { id: 5, title: "References", desc: "Family & nominee" },
  { id: 6, title: "Evaluation", desc: "Risk profile" },
];

type FormState = Partial<CustomerInput>;

interface Props {
  initialCustomer?: Customer;
  draftId?: string;
  initialStep?: number;
  onComplete?: (id: string) => void;
}

export function CustomerWizard({ initialCustomer, draftId, initialStep, onComplete }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!initialCustomer;
  
  const { mutateAsync: createCustomerAsync, isPending: isCreating } = useCreateCustomer();
  const { mutateAsync: updateCustomerAsync, isPending: isUpdating } = useUpdateCustomer();
  const { mutateAsync: saveDraftAsync, isPending: isSavingDraft } = useSaveCustomerDraft();
  const { mutateAsync: deleteDraftAsync } = useDeleteCustomerDraft();

  const [step, setStep] = useState(initialStep ?? 1);
  const [data, setData] = useState<FormState>(initialCustomer ?? {
    country: "India",
    gender: "male",
    maritalStatus: "single",
    residenceType: "own",
    occupationType: "Salaried",
    documents: [],
    cibilScore: 700,
    existingLoans: 0,
    monthlyEmi: 0,
    monthlySalary: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialCustomer) {
      setData(initialCustomer);
    }
  }, [initialCustomer]);

  useEffect(() => {
    if (initialStep) {
      setStep(initialStep);
    }
  }, [initialStep]);

  const update = <K extends keyof CustomerInput>(key: K, value: CustomerInput[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key as string]: "" }));
  };

  const validateStep = (): boolean => {
    const schemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema, step6Schema];
    const result = schemas[step - 1].safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        if (i.path[0]) fieldErrors[String(i.path[0])] = i.message;
      });
      setErrors(fieldErrors);
      toast({ title: "Please fix errors", description: "Some fields need attention", variant: "destructive" });
      return false;
    }
    // Step 3: require Aadhaar front document
    if (step === 3) {
      const hasAadhaar = data.documents?.some((d) => d.type === "aadhaar_front");
      if (!hasAadhaar) {
        setErrors({ aadhaar_doc: "Aadhaar front document is required" });
        toast({ title: "Document required", description: "Please upload Aadhaar front document", variant: "destructive" });
        return false;
      }
    }
    setErrors({});
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    if (step < 6) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSaveDraft = async () => {
    try {
      await saveDraftAsync({ id: draftId, data, step });
      toast({ title: "Draft saved", description: "You can resume later" });
      navigate('/customers?tab=drafts');
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e)
        ? (e.response?.data?.error || e.message)
        : (e instanceof Error ? e.message : String(e));
      toast({ title: "Failed to save draft", description: msg, variant: "destructive" });
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    try {
      const income = (data.monthlySalary ?? 0) + (data.additionalIncome ?? 0);
      const calc = calculateRisk(data.cibilScore ?? 700, income, data.monthlyEmi ?? 0);
      const payload: Partial<Customer> = {
        ...data,
        riskLevel: calc.risk,
        category: calc.category,
      };

      if (isEdit && initialCustomer) {
        await updateCustomerAsync({ id: initialCustomer.id, data: payload });
        toast({ title: "Customer updated", description: data.firstName || "Customer profile" });
        onComplete?.(initialCustomer.id);
        navigate(`/customers`);
      } else {
        const c = await createCustomerAsync(payload);
        if (draftId) {
          try {
            await deleteDraftAsync(draftId);
          } catch (err) {
            console.warn("Failed to cleanup draft after creation:", err);
          }
        }
        toast({ title: "Customer created", description: `${c.customerCode || ""} • ${c.firstName || ""}` });
        onComplete?.(c.id);
        navigate(`/customers`);
      }
    } catch (e: unknown) {
      let serverMsg = "An error occurred while saving.";
      if (axios.isAxiosError(e)) {
        serverMsg = e.response?.data?.details || e.response?.data?.error || e.message;
      } else if (e instanceof Error) {
        serverMsg = e.message;
      }
      toast({ title: "Error", description: serverMsg, variant: "destructive" });
    }
  };

  const setDoc = (type: DocumentType, doc: CustomerDocument | undefined) => {
    const docs = (data.documents ?? []).filter((d) => d.type !== type);
    if (doc) docs.push(doc);
    update("documents", docs);
  };
  const getDoc = (type: DocumentType) => data.documents?.find((d) => d.type === type);

  const progress = (step / 6) * 100;

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-semibold">
              {isEdit ? "Edit Customer" : "New Customer Onboarding"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Step {step} of 6 — {STEPS[step - 1].title}
            </p>
          </div>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />

        <div className="hidden md:flex items-center justify-between gap-2 pt-2">
          {STEPS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => s.id < step && setStep(s.id)}
              className={cn(
                "flex-1 flex items-center gap-2 text-left",
                s.id < step ? "cursor-pointer" : "cursor-default"
              )}
            >
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0",
                  s.id < step && "bg-success text-success-foreground",
                  s.id === step && "bg-primary text-primary-foreground",
                  s.id > step && "bg-secondary text-muted-foreground"
                )}
              >
                {s.id < step ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <div className="hidden lg:block min-w-0">
                <p className={cn("text-xs font-medium truncate", s.id === step && "text-primary")}>
                  {s.title}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
        {step === 1 && <Step1 data={data} errors={errors} update={update} />}
        {step === 2 && <Step2 data={data} errors={errors} update={update} />}
        {step === 3 && <Step3 data={data} errors={errors} update={update} setDoc={setDoc} getDoc={getDoc} />}
        {step === 4 && <Step4 data={data} errors={errors} update={update} />}
        {step === 5 && <Step5 data={data} errors={errors} update={update} />}
        {step === 6 && <Step6 data={data} errors={errors} update={update} />}
      </div>

      {/* Sticky actions */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border -mx-6 px-6 py-4 flex items-center justify-between gap-3 z-10">
        <Button variant="outline" onClick={handleBack} disabled={step === 1 || isSavingDraft || isCreating || isUpdating} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex gap-2">
          {!isEdit && (
            <Button variant="ghost" onClick={handleSaveDraft} disabled={isSavingDraft || isCreating || isUpdating} className="gap-2">
              {isSavingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Draft
            </Button>
          )}
          {step < 6 ? (
            <Button onClick={handleNext} disabled={isSavingDraft || isCreating || isUpdating} className="gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSavingDraft || isCreating || isUpdating} className="gap-2">
              {(isCreating || isUpdating) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} {isEdit ? "Save Changes" : "Create Customer"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* --------- Field helpers --------- */
function Field({
  label, error, required, children,
}: { label: string; error?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface StepProps {
  data: FormState;
  errors: Record<string, string>;
  update: <K extends keyof CustomerInput>(k: K, v: CustomerInput[K]) => void;
}

/* --------- Step 1 --------- */
function Step1({ data, errors, update }: StepProps) {
  return (
    <div className="space-y-5">
      <PhotoUpload value={data.photoDataUrl} onChange={(v) => update("photoDataUrl", v as string)} />
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="First Name" required error={errors.firstName}>
          <Input value={data.firstName ?? ""} onChange={(e) => update("firstName", e.target.value)} />
        </Field>
        <Field label="Last Name" error={errors.lastName}>
          <Input value={data.lastName ?? ""} onChange={(e) => update("lastName", e.target.value)} />
        </Field>
        <Field label="Gender" required error={errors.gender}>
          <Select value={data.gender || undefined} onValueChange={(v) => update("gender", v as Customer["gender"])}>
            <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Date of Birth" required error={errors.dob}>
          <DatePicker
            context="dob"
            date={data.dob ? new Date(data.dob) : undefined}
            setDate={(d) => {
              if (d) {
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                update("dob", `${year}-${month}-${day}`);
              } else {
                update("dob", "");
              }
            }}
            placeholder="Select Date of Birth"
          />
          {data.dob && (
            <p className="text-xs text-muted-foreground mt-1">
              Age: {Math.floor((Date.now() - new Date(data.dob).getTime()) / (365.25 * 24 * 3600 * 1000))} years
            </p>
          )}
        </Field>
        <Field label="Mobile Number" required error={errors.mobile}>
          <Input value={data.mobile ?? ""} maxLength={10} onChange={(e) => update("mobile", e.target.value.replace(/\D/g, ""))} placeholder="9876543210" />
        </Field>
        <Field label="Alternate Number" error={errors.altMobile}>
          <Input value={data.altMobile ?? ""} maxLength={10} onChange={(e) => update("altMobile", e.target.value.replace(/\D/g, ""))} />
        </Field>
        <Field label="Email" error={errors.email}>
          <Input type="email" value={data.email ?? ""} onChange={(e) => update("email", e.target.value)} />
        </Field>
        <Field label="Marital Status" required error={errors.maritalStatus}>
          <Select value={data.maritalStatus || undefined} onValueChange={(v) => update("maritalStatus", v as Customer["maritalStatus"])}>
            <SelectTrigger><SelectValue placeholder="Select Marital Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="married">Married</SelectItem>
              <SelectItem value="divorced">Divorced</SelectItem>
              <SelectItem value="widowed">Widowed</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

/* --------- Step 2 --------- */
function Step2({ data, errors, update }: StepProps) {
  const currentCountry = data.country || "India";
  const currentState = data.state || "";
  const currentDistrict = data.city || "";

  const { countries } = useCountries();
  const { states } = useStates(currentCountry);
  const { districts } = useDistricts(currentCountry, currentState);

  const isStateDisabled = !currentCountry;
  const isDistrictDisabled = !currentCountry || !currentState;

  const handleCountryChange = (val: string) => {
    update("country", val);
    update("state", "");
    update("city", "");
  };

  const handleStateChange = (val: string) => {
    update("state", val);
    update("city", "");
  };

  const handleDistrictChange = (val: string) => {
    update("city", val);
  };

  return (
    <div className="space-y-4">
      <Field label="Current Address" required error={errors.currentAddress}>
        <Textarea rows={2} value={data.currentAddress ?? ""} onChange={(e) => update("currentAddress", e.target.value)} />
      </Field>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => update("permanentAddress", data.currentAddress ?? "")}
          className="text-xs text-primary hover:underline"
        >
          Same as current address
        </button>
      </div>
      <Field label="Permanent Address" required error={errors.permanentAddress}>
        <Textarea rows={2} value={data.permanentAddress ?? ""} onChange={(e) => update("permanentAddress", e.target.value)} />
      </Field>

      <div className="grid md:grid-cols-3 gap-4">
        {/* Country Master */}
        <Field label="Country" required error={errors.country}>
          <Select value={currentCountry || undefined} onValueChange={handleCountryChange}>
            <SelectTrigger><SelectValue placeholder="Select Country" /></SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* State Master */}
        <Field label="State" required error={errors.state}>
          <Select
            disabled={isStateDisabled}
            value={currentState || undefined}
            onValueChange={handleStateChange}
          >
            <SelectTrigger disabled={isStateDisabled}>
              <SelectValue placeholder={isStateDisabled ? "Select Country first" : "Select State"} />
            </SelectTrigger>
            <SelectContent>
              {states.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* District / City Master */}
        <Field label="District / City" required error={errors.city}>
          <Select
            disabled={isDistrictDisabled}
            value={currentDistrict || undefined}
            onValueChange={handleDistrictChange}
          >
            <SelectTrigger disabled={isDistrictDisabled}>
              <SelectValue placeholder={!currentCountry ? "Select Country first" : !currentState ? "Select State first" : "Select District"} />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Pincode */}
        <Field label="Pincode" required error={errors.pincode}>
          <Input value={data.pincode ?? ""} maxLength={6} onChange={(e) => update("pincode", e.target.value.replace(/\D/g, ""))} />
        </Field>
        {/* Landmark */}
        <Field label="Landmark" error={errors.landmark}>
          <Input value={data.landmark ?? ""} onChange={(e) => update("landmark", e.target.value)} />
        </Field>
        {/* Residence Type */}
        <Field label="Residence Type" required error={errors.residenceType}>
          <Select value={data.residenceType || undefined} onValueChange={(v) => update("residenceType", v as Customer["residenceType"])}>
            <SelectTrigger><SelectValue placeholder="Select Residence Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="own">Own</SelectItem>
              <SelectItem value="rent">Rent</SelectItem>
              <SelectItem value="family">Family</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

/* --------- Step 3 --------- */
function Step3({
  data, errors, update, setDoc, getDoc,
}: StepProps & {
  setDoc: (t: DocumentType, d: CustomerDocument | undefined) => void;
  getDoc: (t: DocumentType) => CustomerDocument | undefined;
}) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Aadhaar Number" required error={errors.aadhaarNumber}>
          <Input value={data.aadhaarNumber ?? ""} maxLength={12} onChange={(e) => update("aadhaarNumber", e.target.value.replace(/\D/g, ""))} />
        </Field>
        <Field label="PAN Number" required error={errors.panNumber}>
          <Input value={data.panNumber ?? ""} maxLength={10} onChange={(e) => update("panNumber", e.target.value.toUpperCase())} placeholder="ABCDE1234F" />
        </Field>
        <Field label="Voter ID" error={errors.voterId}>
          <Input value={data.voterId ?? ""} onChange={(e) => update("voterId", e.target.value.toUpperCase())} />
        </Field>
        <Field label="Driving License" error={errors.drivingLicense}>
          <Input value={data.drivingLicense ?? ""} onChange={(e) => update("drivingLicense", e.target.value.toUpperCase())} />
        </Field>
        <Field label="Passport" error={errors.passport}>
          <Input value={data.passport ?? ""} onChange={(e) => update("passport", e.target.value.toUpperCase())} />
        </Field>
      </div>
      <div className="border-t border-border pt-5">
        <h3 className="text-sm font-semibold mb-4">Document Uploads</h3>
        {errors.aadhaar_doc && (
          <p className="text-sm text-destructive mb-3">{errors.aadhaar_doc}</p>
        )}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(["aadhaar_front", "aadhaar_back", "pan_card", "selfie", "signature", "address_proof", "additional"] as DocumentType[]).map((t) => (
            <DocumentUpload key={t} type={t} value={getDoc(t)} onChange={(d) => setDoc(t, d)} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* --------- Step 4 --------- */
function Step4({ data, errors, update }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Occupation Type" required error={errors.occupationType}>
          <Select value={data.occupationType || undefined} onValueChange={(v) => update("occupationType", v)}>
            <SelectTrigger><SelectValue placeholder="Select Occupation" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Salaried">Salaried</SelectItem>
              <SelectItem value="Self-employed">Self-employed</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
              <SelectItem value="Farmer">Farmer</SelectItem>
              <SelectItem value="Professional">Professional</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Company Name" error={errors.companyName}>
          <Input value={data.companyName ?? ""} onChange={(e) => update("companyName", e.target.value)} />
        </Field>
        <Field label="Designation" error={errors.designation}>
          <Input value={data.designation ?? ""} onChange={(e) => update("designation", e.target.value)} />
        </Field>
        <Field label="Work Experience" error={errors.workExperience}>
          <Input value={data.workExperience ?? ""} onChange={(e) => update("workExperience", e.target.value)} placeholder="e.g. 5 years" />
        </Field>
        <Field label="Monthly Salary (₹)" required error={errors.monthlySalary}>
          <Input
            type="number"
            value={data.monthlySalary ?? ""}
            onChange={(e) => update("monthlySalary", e.target.value === "" ? 0 : Number(e.target.value))}
          />
        </Field>
        <Field label="Additional Income (₹)" error={errors.additionalIncome}>
          <Input
            type="number"
            value={data.additionalIncome ?? ""}
            onChange={(e) => update("additionalIncome", e.target.value === "" ? 0 : Number(e.target.value))}
          />
        </Field>
        <Field label="Business Name (if self-employed)" error={errors.businessName}>
          <Input value={data.businessName ?? ""} onChange={(e) => update("businessName", e.target.value)} />
        </Field>
      </div>
      <div className="border-t border-border pt-5">
        <h3 className="text-sm font-semibold mb-4">Bank Details</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <Field label="Bank Name" required error={errors.bankName}>
            <Input value={data.bankName ?? ""} onChange={(e) => update("bankName", e.target.value)} />
          </Field>
          <Field label="Account Number" required error={errors.accountNumber}>
            <Input value={data.accountNumber ?? ""} onChange={(e) => update("accountNumber", e.target.value)} />
          </Field>
          <Field label="IFSC Code" required error={errors.ifscCode}>
            <Input value={data.ifscCode ?? ""} maxLength={11} onChange={(e) => update("ifscCode", e.target.value.toUpperCase())} placeholder="SBIN0001234" />
          </Field>
        </div>
      </div>
    </div>
  );
}

/* --------- Step 5 --------- */
function Step5({ data, errors, update }: StepProps) {
  return (
    <div className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Father's Name" required error={errors.fatherName}>
          <Input value={data.fatherName ?? ""} onChange={(e) => update("fatherName", e.target.value)} />
        </Field>
        <Field label="Mother's Name" required error={errors.motherName}>
          <Input value={data.motherName ?? ""} onChange={(e) => update("motherName", e.target.value)} />
        </Field>
        <Field label="Spouse Name" error={errors.spouseName}>
          <Input value={data.spouseName ?? ""} onChange={(e) => update("spouseName", e.target.value)} />
        </Field>
      </div>
      <div className="border-t border-border pt-5 space-y-4">
        <h3 className="text-sm font-semibold">Nominee</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Nominee Name" required error={errors.nomineeName}>
            <Input value={data.nomineeName ?? ""} onChange={(e) => update("nomineeName", e.target.value)} />
          </Field>
          <Field label="Relation" required error={errors.nomineeRelation}>
            <Input value={data.nomineeRelation ?? ""} onChange={(e) => update("nomineeRelation", e.target.value)} placeholder="e.g. Spouse" />
          </Field>
        </div>
      </div>
      <div className="border-t border-border pt-5 space-y-4">
        <h3 className="text-sm font-semibold">References</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Reference 1 Name" required error={errors.reference1Name}>
            <Input value={data.reference1Name ?? ""} onChange={(e) => update("reference1Name", e.target.value)} />
          </Field>
          <Field label="Reference 1 Mobile" required error={errors.reference1Mobile}>
            <Input value={data.reference1Mobile ?? ""} maxLength={10} onChange={(e) => update("reference1Mobile", e.target.value.replace(/\D/g, ""))} />
          </Field>
          <Field label="Reference 2 Name" error={errors.reference2Name}>
            <Input value={data.reference2Name ?? ""} onChange={(e) => update("reference2Name", e.target.value)} />
          </Field>
          <Field label="Reference 2 Mobile" error={errors.reference2Mobile}>
            <Input value={data.reference2Mobile ?? ""} maxLength={10} onChange={(e) => update("reference2Mobile", e.target.value.replace(/\D/g, ""))} />
          </Field>
        </div>
      </div>
    </div>
  );
}

/* --------- Step 6 --------- */
function Step6({ data, errors, update }: StepProps) {
  const income = (data.monthlySalary ?? 0) + (data.additionalIncome ?? 0);
  const calc = calculateRisk(data.cibilScore ?? 700, income, data.monthlyEmi ?? 0);
  const dti = income > 0 ? ((data.monthlyEmi ?? 0) / income) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Field label="CIBIL Score (300-900)" required error={errors.cibilScore}>
          <Input
            type="number"
            value={data.cibilScore ?? ""}
            min={300}
            max={900}
            onChange={(e) => update("cibilScore", e.target.value === "" ? 700 : Number(e.target.value))}
          />
        </Field>
        <Field label="Existing Loans" required error={errors.existingLoans}>
          <Input
            type="number"
            value={data.existingLoans ?? ""}
            min={0}
            onChange={(e) => update("existingLoans", e.target.value === "" ? 0 : Number(e.target.value))}
          />
        </Field>
        <Field label="Monthly EMI (₹)" required error={errors.monthlyEmi}>
          <Input
            type="number"
            value={data.monthlyEmi ?? ""}
            min={0}
            onChange={(e) => update("monthlyEmi", e.target.value === "" ? 0 : Number(e.target.value))}
          />
        </Field>
      </div>
      <div className="rounded-xl border border-border bg-secondary/30 p-5 space-y-4">
        <h3 className="text-sm font-semibold">Auto-calculated Evaluation</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Total Income" value={`₹${income.toLocaleString("en-IN")}`} />
          <Stat label="Debt-to-Income" value={`${dti.toFixed(1)}%`} />
          <div>
            <p className="text-xs text-muted-foreground mb-2">Risk Level</p>
            <RiskBadge level={calc.risk} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-2">Category</p>
            <CategoryBadge category={calc.category} />
          </div>
        </div>
        <p className="text-xs text-muted-foreground pt-2">
          Risk and category are computed from CIBIL score and debt-to-income ratio. They update automatically.
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}
