import { Bell, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const notifications = [
  { id: 1, title: "EMI Due Reminder", message: "Rajesh Kumar's EMI of ₹9,614 is due tomorrow", type: "warning", time: "5 min ago", read: false },
  { id: 2, title: "Overdue Alert", message: "Suresh Patel has missed EMI payment for 32 days", type: "danger", time: "1 hr ago", read: false },
  { id: 3, title: "New Customer", message: "Anil Reddy has been added to the system", type: "info", time: "2 hrs ago", read: false },
  { id: 4, title: "Chit Payment Due", message: "Gold Chit A monthly collection is due on June 1", type: "warning", time: "3 hrs ago", read: true },
  { id: 5, title: "Loan Approved", message: "Personal loan of ₹2,00,000 approved for Priya Sharma", type: "success", time: "5 hrs ago", read: true },
  { id: 6, title: "Daily Summary", message: "Total collections today: ₹37,000. Pending: ₹31,000", type: "info", time: "Yesterday", read: true },
];

const typeColors: Record<string, string> = {
  warning: "bg-warning/10 text-warning",
  danger: "bg-destructive/10 text-destructive",
  info: "bg-info/10 text-info",
  success: "bg-success/10 text-success",
};

export default function Notifications() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground text-sm mt-1">Stay updated with alerts and reminders</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2"><CheckCircle2 className="w-4 h-4" /> Mark all read</Button>
      </div>

      <div className="space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`bg-card rounded-xl border border-border p-4 flex items-start gap-4 transition-all hover:shadow-sm ${!n.read ? "border-l-2 border-l-primary" : ""}`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${typeColors[n.type]}`}>
              <Bell className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">{n.title}</h3>
                {!n.read && <span className="w-2 h-2 bg-primary rounded-full" />}
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
