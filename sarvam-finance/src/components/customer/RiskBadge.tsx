import { Badge } from "@/components/ui/badge";
import { CustomerCategory, RiskLevel } from "@/lib/customer-types";
import { cn } from "@/lib/utils";

const riskMap: Record<RiskLevel, { label: string; className: string }> = {
  low: { label: "Low Risk", className: "bg-success/10 text-success border-success/20" },
  medium: { label: "Medium Risk", className: "bg-warning/10 text-warning border-warning/20" },
  high: { label: "High Risk", className: "bg-destructive/10 text-destructive border-destructive/20" },
  very_high: { label: "Very High Risk", className: "bg-destructive text-destructive-foreground border-destructive" },
};

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const m = riskMap[level];
  return (
    <Badge variant="outline" className={cn("font-medium", m.className, className)}>
      {m.label}
    </Badge>
  );
}

const categoryMap: Record<CustomerCategory, { label: string; className: string }> = {
  excellent: { label: "Excellent", className: "bg-success/10 text-success border-success/20" },
  good: { label: "Good", className: "bg-info/10 text-info border-info/20" },
  medium: { label: "Medium", className: "bg-warning/10 text-warning border-warning/20" },
  risky: { label: "Risky", className: "bg-destructive/10 text-destructive border-destructive/20" },
};

export function CategoryBadge({ category, className }: { category: CustomerCategory; className?: string }) {
  const m = categoryMap[category];
  return (
    <Badge variant="outline" className={cn("font-medium", m.className, className)}>
      {m.label}
    </Badge>
  );
}

export function CibilScore({ score }: { score: number }) {
  const color =
    score >= 750 ? "text-success" : score >= 650 ? "text-warning" : "text-destructive";
  return <span className={cn("font-semibold", color)}>{score}</span>;
}
