import { Users } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { useCustomers } from "@/hooks/use-customers";

export function TotalCustomersCard() {
  const { customers, isLoading } = useCustomers();

  return (
    <StatCard 
      title="Total Customers" 
      value={isLoading ? "..." : customers.length} 
      icon={Users} 
      variant="primary" 
    />
  );
}
