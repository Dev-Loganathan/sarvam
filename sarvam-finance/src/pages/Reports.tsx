import { FileBarChart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const reportTypes = [
  { title: "Customer Report", description: "Complete customer database with details", icon: "👥" },
  { title: "Loan Report", description: "All active and closed loan details", icon: "🏦" },
  { title: "EMI Pending Report", description: "Outstanding EMI collection summary", icon: "⏰" },
  { title: "Chit Fund Report", description: "Chit group status and payments", icon: "💰" },
  { title: "Monthly Profit Report", description: "Revenue, expenses, and net profit", icon: "📊" },
  { title: "Staff Collection Report", description: "Collection performance by staff", icon: "👤" },
  { title: "Defaulter Report", description: "Overdue customers and risk analysis", icon: "⚠️" },
  { title: "Audit Log", description: "System activity and change history", icon: "📋" },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground text-sm mt-1">Generate and download financial reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {reportTypes.map((report) => (
          <div key={report.title} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <div className="text-3xl mb-3">{report.icon}</div>
            <h3 className="font-semibold text-sm">{report.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 mb-4">{report.description}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="text-xs h-7 gap-1"><Download className="w-3 h-3" /> PDF</Button>
              <Button size="sm" variant="outline" className="text-xs h-7 gap-1"><Download className="w-3 h-3" /> Excel</Button>
              <Button size="sm" variant="outline" className="text-xs h-7 gap-1"><Download className="w-3 h-3" /> CSV</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
