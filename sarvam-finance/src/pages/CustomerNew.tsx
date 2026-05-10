import { CustomerWizard } from "@/components/customer/CustomerWizard";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerNew() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/customers")} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Customers
        </Button>
      </div>
      <CustomerWizard />
    </div>
  );
}
