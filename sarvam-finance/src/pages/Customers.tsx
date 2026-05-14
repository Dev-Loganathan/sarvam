import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search, Plus, Filter, Eye, Edit2, UserX, UserCheck, Upload,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCustomers, useUpdateCustomerStatus, useCustomerDrafts } from "@/hooks/use-customers";
import { CibilScore, RiskBadge } from "@/components/customer/RiskBadge";
import { InactiveDialog } from "@/components/customer/InactiveDialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type FilterKey = "all" | "active" | "inactive" | "risky" | "excellent" | "high_cibil" | "low_cibil";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
  { key: "risky", label: "High Risk" },
  { key: "excellent", label: "Excellent Category" },
  { key: "high_cibil", label: "CIBIL 750+" },
  { key: "low_cibil", label: "CIBIL <600" },
];

export default function Customers() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { customers, isLoading } = useCustomers();
  const { data: drafts = [], isLoading: isDraftsLoading } = useCustomerDrafts();
  const { mutate: updateStatus } = useUpdateCustomerStatus();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [inactiveTarget, setInactiveTarget] = useState<{ id: string; name: string } | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return customers.filter((c) => {
      const matchesSearch = !q
        || c.firstName.toLowerCase().includes(q)
        || (c.lastName ?? "").toLowerCase().includes(q)
        || c.mobile.includes(q)
        || c.aadhaarNumber.includes(q)
        || c.customerCode.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (filter === "active") return c.status === "active";
      if (filter === "inactive") return c.status === "inactive";
      if (filter === "risky") return c.riskLevel === "high" || c.riskLevel === "very_high";
      if (filter === "excellent") return c.category === "excellent";
      if (filter === "high_cibil") return c.cibilScore >= 750;
      if (filter === "low_cibil") return c.cibilScore < 600;
      return true;
    });
  }, [customers, search, filter]);

  const stats = useMemo(() => ({
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    inactive: customers.filter((c) => c.status === "inactive").length,
    risky: customers.filter((c) => c.riskLevel === "high" || c.riskLevel === "very_high").length,
  }), [customers]);

  const handleReactivate = (id: string, name: string) => {
    updateStatus(
      { id, status: "active" },
      {
        onSuccess: () => {
          toast({ title: "Customer reactivated", description: name });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your customer database — onboarding, KYC, profiles
          </p>
        </div>
        <Button onClick={() => navigate("/customers/new")} className="gap-2">
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Total" value={stats.total} />
        <SummaryCard label="Active" value={stats.active} accent="text-success" />
        <SummaryCard label="Inactive" value={stats.inactive} accent="text-muted-foreground" />
        <SummaryCard label="High Risk" value={stats.risky} accent="text-destructive" />
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Customers</TabsTrigger>
          <TabsTrigger value="drafts">Partially Saved ({drafts.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="m-0">
          <div className="bg-card rounded-xl border border-border">
            {/* Toolbar */}
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search name, mobile, Aadhaar, ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" /> Filters
            </Button>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-accent"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty state & Loading state */}
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  {["Customer", "Mobile", "City", "Occupation", "CIBIL", "Risk", "Status", "Actions"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium text-muted-foreground p-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-9 h-9 rounded-full" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                      </div>
                    </td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="p-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                    <td className="p-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="p-4"><Skeleton className="h-8 w-24" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 rounded-full bg-secondary mx-auto flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No customers found</p>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              {customers.length === 0 ? "Get started by adding your first customer" : "Try adjusting your search or filters"}
            </p>
            {customers.length === 0 && (
              <Button onClick={() => navigate("/customers/new")} className="gap-2">
                <Plus className="w-4 h-4" /> Add First Customer
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {["Customer", "Mobile", "City", "Occupation", "CIBIL", "Risk", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground p-4 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    const initials = `${c.firstName[0] ?? ""}${c.lastName?.[0] ?? ""}`.toUpperCase();
                    return (
                      <tr key={c.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                        <td className="p-4">
                          <Link to={`/customers/${c.id}`} className="flex items-center gap-3 group">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary overflow-hidden shrink-0">
                              {c.photoDataUrl ? (
                                <img src={c.photoDataUrl} alt={c.firstName} className="w-full h-full object-cover" />
                              ) : initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm group-hover:text-primary truncate">
                                {c.firstName} {c.lastName ?? ""}
                              </p>
                              <p className="text-xs text-muted-foreground">{c.customerCode}</p>
                            </div>
                          </Link>
                        </td>
                        <td className="p-4 text-sm whitespace-nowrap">{c.mobile}</td>
                        <td className="p-4 text-sm">{c.city}</td>
                        <td className="p-4 text-sm text-muted-foreground">{c.occupationType}</td>
                        <td className="p-4 text-sm"><CibilScore score={c.cibilScore} /></td>
                        <td className="p-4"><RiskBadge level={c.riskLevel} /></td>
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs capitalize",
                              c.status === "active"
                                ? "bg-success/10 text-success border-success/20"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {c.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => navigate(`/customers/${c.id}`)}
                              className="p-1.5 rounded-md hover:bg-secondary"
                              title="View profile"
                            >
                              <Eye className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => navigate(`/customers/${c.id}/edit`)}
                              className="p-1.5 rounded-md hover:bg-secondary"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              onClick={() => navigate(`/customers/${c.id}?tab=documents`)}
                              className="p-1.5 rounded-md hover:bg-secondary"
                              title="Documents"
                            >
                              <Upload className="w-4 h-4 text-muted-foreground" />
                            </button>
                            {c.status === "active" ? (
                              <button
                                onClick={() => setInactiveTarget({ id: c.id, name: `${c.firstName} ${c.lastName ?? ""}` })}
                                className="p-1.5 rounded-md hover:bg-destructive/10"
                                title="Mark inactive"
                              >
                                <UserX className="w-4 h-4 text-destructive" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(c.id, c.firstName)}
                                className="p-1.5 rounded-md hover:bg-success/10"
                                title="Reactivate"
                              >
                                <UserCheck className="w-4 h-4 text-success" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between text-sm text-muted-foreground">
              <span>Showing {filtered.length} of {customers.length} customers</span>
            </div>
          </>
        )}
          </div>
        </TabsContent>

        <TabsContent value="drafts" className="m-0">
          <div className="bg-card rounded-xl border border-border">
            {isDraftsLoading ? (
              <div className="p-12 text-center text-muted-foreground">Loading drafts...</div>
            ) : drafts.length === 0 ? (
              <div className="p-12 text-center">
                <p className="font-medium">No saved drafts</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Drafts will appear here when you save a customer form partially.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left text-xs font-medium text-muted-foreground p-4 whitespace-nowrap">Customer</th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-4 whitespace-nowrap">Mobile</th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-4 whitespace-nowrap">Current Step</th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-4 whitespace-nowrap">Last Saved</th>
                      <th className="text-left text-xs font-medium text-muted-foreground p-4 whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {drafts.map((d) => {
                      const firstName = d.data?.firstName || "Unknown";
                      const lastName = d.data?.lastName || "";
                      const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase() || "?";
                      
                      return (
                        <tr key={d.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary overflow-hidden shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {firstName} {lastName}
                                </p>
                                <p className="text-xs text-muted-foreground">Draft ID: {d.id.slice(0, 8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm whitespace-nowrap">{d.data?.mobile || "—"}</td>
                          <td className="p-4">
                            <Badge variant="secondary" className="font-normal">Step {d.step}</Badge>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(d.updatedAt || d.createdAt).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="p-4">
                            <Button size="sm" variant="outline" className="h-8 gap-2 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700" onClick={() => navigate(`/customers/new?draftId=${d.id}`)}>
                              <Edit2 className="w-3.5 h-3.5" /> Resume
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {inactiveTarget && (
        <InactiveDialog
          customerId={inactiveTarget.id}
          customerName={inactiveTarget.name}
          open={!!inactiveTarget}
          onOpenChange={(o) => !o && setInactiveTarget(null)}
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-2xl font-bold mt-1", accent)}>{value}</p>
    </div>
  );
}
