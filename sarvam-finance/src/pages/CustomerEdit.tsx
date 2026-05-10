import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomerWizard } from "@/components/customer/CustomerWizard";
import { useCustomers } from "@/hooks/use-customers";

export default function CustomerEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const customer = useCustomers().find((c) => c.id === id);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/customers/${customer.id}`)} className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Profile
        </Button>
      </div>
      <CustomerWizard initialCustomer={customer} />
    </div>
  );
}
