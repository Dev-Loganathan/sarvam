import { chitFunds } from "@/lib/mock-data";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function ChitFunds() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Chit Funds</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage chit groups and subscriptions</p>
        </div>
        <Button className="gap-2"><Plus className="w-4 h-4" /> New Chit Group</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {chitFunds.map((chit) => {
          const progress = Math.round((chit.completedMonths / chit.duration) * 100);
          return (
            <div key={chit.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{chit.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{chit.id}</p>
                </div>
                <Badge variant="default" className="text-xs">{chit.status}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Monthly</p>
                  <p className="font-semibold text-sm">₹{chit.monthlyAmount.toLocaleString("en-IN")}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Total Value</p>
                  <p className="font-semibold text-sm">₹{chit.totalValue.toLocaleString("en-IN")}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                <span>{chit.currentMembers}/{chit.totalMembers} members</span>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{chit.completedMonths}/{chit.duration} months</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <Button variant="outline" className="w-full mt-4" size="sm">View Details</Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
