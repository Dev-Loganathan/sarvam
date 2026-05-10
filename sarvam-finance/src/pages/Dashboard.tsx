import {
  Users,
  Landmark,
  CheckCircle2,
  Clock,
  CircleDollarSign,
  IndianRupee,
  AlertTriangle,
  UserPlus,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { dashboardStats, revenueData, loanDistribution, recentActivities, topDefaulters } from "@/lib/mock-data";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

const formatCurrency = (v: number) =>
  "₹" + (v >= 100000 ? (v / 100000).toFixed(1) + "L" : v.toLocaleString("en-IN"));

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome back! Here's your financial overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="Total Customers" value={dashboardStats.totalCustomers} icon={Users} variant="primary" trend={{ value: 7.2, label: "this month" }} />
        <StatCard title="Active Loans" value={dashboardStats.activeLoans} icon={Landmark} variant="primary" />
        <StatCard title="Pending EMI" value={dashboardStats.pendingEMI} icon={Clock} variant="warning" />
        <StatCard title="Monthly Income" value={formatCurrency(dashboardStats.monthlyIncome)} icon={IndianRupee} variant="success" trend={{ value: 3.8, label: "vs last month" }} />
        <StatCard title="Overdue" value={dashboardStats.overdueCustomers} icon={AlertTriangle} variant="destructive" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Revenue & Collections</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="collectedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tickFormatter={(v) => `${(v / 100000).toFixed(0)}L`} className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} contentStyle={{ borderRadius: "0.5rem", border: "1px solid hsl(var(--border))" }} />
              <Area type="monotone" dataKey="income" stroke="hsl(var(--chart-1))" fill="url(#incomeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="collected" stroke="hsl(var(--chart-2))" fill="url(#collectedGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Distribution */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Loan Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={loanDistribution} innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                {loanDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {loanDistribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  activity.type === "payment" ? "bg-success" :
                  activity.type === "loan" ? "bg-primary" :
                  activity.type === "overdue" ? "bg-destructive" :
                  activity.type === "chit" ? "bg-warning" : "bg-info"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm">{activity.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                    {activity.amount && (
                      <span className="text-xs font-medium text-primary">{formatCurrency(activity.amount)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Defaulters */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-semibold mb-4">Top Defaulters</h3>
          <div className="space-y-3">
            {topDefaulters.map((d, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                <div>
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.daysOverdue} days overdue</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-destructive">{formatCurrency(d.amount)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    d.risk === "high" ? "bg-destructive/10 text-destructive" :
                    d.risk === "medium" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                  }`}>
                    {d.risk} risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
