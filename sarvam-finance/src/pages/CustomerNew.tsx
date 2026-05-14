import { CustomerWizard } from "@/components/customer/CustomerWizard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCustomerDraft } from "@/hooks/use-customers";

export default function CustomerNew() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get("draftId");
  const { data: draft, isLoading } = useCustomerDraft(draftId || undefined);

  if (draftId && isLoading) {
    return <div className="p-12 text-center text-muted-foreground">Loading draft...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/customers")} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Customers
        </Button>
      </div>
      <CustomerWizard 
        initialCustomer={draft?.data} 
        draftId={draft?.id} 
        initialStep={draft?.step} 
      />
    </div>
  );
}
