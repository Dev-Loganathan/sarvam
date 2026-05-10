import { TotalCustomersCard } from "@/components/dashboard/TotalCustomersCard";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TotalCustomersCard />
        {/* Additional cards like ActiveLoansCard, PendingEMICard can be added here later */}
      </div>

      {/* Placeholder for future sections */}
      {/* 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        ...
      </div>
      */}
    </div>
  );
}
