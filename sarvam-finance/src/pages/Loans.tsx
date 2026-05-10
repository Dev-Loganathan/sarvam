import { useState } from "react";
import { loans } from "@/lib/mock-data";
import { Search, Plus, Filter, Eye, Edit2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function Loans() {
  const [search, setSearch] = useState("");
  const filtered = loans.filter(
    (l) => l.customerName.toLowerCase().includes(search.toLowerCase()) || l.id.toLowerCase().includes(search.toLowerCase())
  );

  const statusVariant = (s: string) =>
    s === "active" ? "default" : s === "overdue" ? "destructive" : "secondary";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Loan Management</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage all loans</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> New Loan</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Loans", value: loans.filter((l) => l.status === "active").length, color: "text-primary" },
          { label: "Overdue", value: loans.filter((l) => l.status === "overdue").length, color: "text-destructive" },
          { label: "Total Disbursed", value: "₹" + (loans.reduce((s, l) => s + l.amount, 0) / 100000).toFixed(1) + "L", color: "text-success" },
          { label: "Monthly EMI Due", value: "₹" + (loans.filter((l) => l.status !== "closed").reduce((s, l) => s + l.emi, 0) / 1000).toFixed(0) + "K", color: "text-warning" },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border">
        <div className="p-4 border-b border-border flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search loans..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Button variant="outline" size="sm" className="gap-2"><Filter className="w-4 h-4" /> Filter</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Loan ID", "Customer", "Type", "Amount", "EMI", "Interest", "Progress", "Status", ""].map((h) => (
                  <th key={h} className="text-left text-xs font-medium text-muted-foreground p-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((loan) => {
                const progress = Math.round((loan.paid / loan.duration) * 100);
                return (
                  <tr key={loan.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="p-4 text-sm font-medium">{loan.id}</td>
                    <td className="p-4">
                      <p className="text-sm font-medium">{loan.customerName}</p>
                      <p className="text-xs text-muted-foreground">{loan.customerId}</p>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline" className="text-xs">{loan.type}</Badge>
                    </td>
                    <td className="p-4 text-sm font-semibold">₹{loan.amount.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-sm">₹{loan.emi.toLocaleString("en-IN")}</td>
                    <td className="p-4 text-sm">{loan.interest}%</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Progress value={progress} className="h-2 w-20" />
                        <span className="text-xs text-muted-foreground">{loan.paid}/{loan.duration}</span>
                      </div>
                    </td>
                    <td className="p-4"><Badge variant={statusVariant(loan.status)} className="text-xs">{loan.status}</Badge></td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-md hover:bg-secondary"><Eye className="w-4 h-4 text-muted-foreground" /></button>
                        <button className="p-1.5 rounded-md hover:bg-secondary"><Edit2 className="w-4 h-4 text-muted-foreground" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
