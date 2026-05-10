import { CreditCard, IndianRupee, Clock, CheckCircle2 } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const payments = [
  { id: "PAY001", customer: "Rajesh Kumar", type: "EMI", amount: 9614, date: "2024-06-15", status: "collected" },
  { id: "PAY002", customer: "Priya Sharma", type: "EMI", amount: 13215, date: "2024-06-15", status: "pending" },
  { id: "PAY003", customer: "Suresh Patel", type: "EMI", amount: 17584, date: "2024-06-10", status: "overdue" },
  { id: "PAY004", customer: "Venkat Rao", type: "EMI", amount: 14122, date: "2024-06-15", status: "collected" },
  { id: "PAY005", customer: "Gold Chit A - Members", type: "Chit", amount: 200000, date: "2024-06-01", status: "collected" },
  { id: "PAY006", customer: "Ramesh Yadav", type: "EMI", amount: 8926, date: "2024-06-08", status: "overdue" },
];

export default function Payments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payment Collections</h1>
          <p className="text-muted-foreground text-sm mt-1">Track daily EMI and chit payments</p>
        </div>
        <Button className="gap-2"><CreditCard className="w-4 h-4" /> Record Payment</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Collection" value="₹37K" icon={IndianRupee} variant="success" />
        <StatCard title="Pending Today" value="₹31K" icon={Clock} variant="warning" />
        <StatCard title="Overdue" value="₹26K" icon={CreditCard} variant="destructive" />
        <StatCard title="Collected This Month" value="₹6.2L" icon={CheckCircle2} variant="primary" />
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Today's Collection Schedule</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["ID", "Customer", "Type", "Amount", "Due Date", "Status", "Action"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="p-4 text-sm font-medium">{p.id}</td>
                  <td className="p-4 text-sm">{p.customer}</td>
                  <td className="p-4"><Badge variant="outline" className="text-xs">{p.type}</Badge></td>
                  <td className="p-4 text-sm font-semibold">₹{p.amount.toLocaleString("en-IN")}</td>
                  <td className="p-4 text-sm text-muted-foreground">{p.date}</td>
                  <td className="p-4">
                    <Badge
                      variant={p.status === "collected" ? "default" : p.status === "overdue" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {p.status !== "collected" && (
                      <Button size="sm" variant="outline" className="text-xs h-7">Collect</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
