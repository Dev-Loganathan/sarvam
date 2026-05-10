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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Customers" value={dashboardStats.totalCustomers} icon={Users} variant="primary" trend={{ value: 7.2, label: "this month" }} />
        {/* Loan stats hidden for initial launch */}
      </div>

      {/* Charts and activity hidden for initial launch */}
      {/* 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        ...
      </div>
      */}
    </div>
  );
}
