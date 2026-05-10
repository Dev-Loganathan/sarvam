import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Landmark,
  CircleDollarSign,
  CreditCard,
  FileBarChart,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  UserCog,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/", permission: null },
  { label: "Customers", icon: Users, path: "/customers", permission: "customer:view" },
  { label: "Loans", icon: Landmark, path: "/loans", permission: "loan:view" },
  { label: "Chit Funds", icon: CircleDollarSign, path: "/chit-funds", permission: "chit:view" },
  { label: "Payments", icon: CreditCard, path: "/payments", permission: "payment:view" },
  { label: "Reports", icon: FileBarChart, path: "/reports", permission: "report:view" },
  { label: "Notifications", icon: Bell, path: "/notifications", permission: null },
  { label: "User Management", icon: UserCog, path: "/users", permission: "user:view" },
  { label: "Settings", icon: Settings, path: "/settings", permission: null },
];

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, hasPermission } = useAuth();

  // Filter nav items based on user permissions
  const visibleNavItems = navItems.filter(
    (item) => item.permission === null || hasPermission(item.permission)
  );

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = user
    ? `${user.firstName[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "?";

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground flex flex-col z-30 transition-all duration-300 ${
        collapsed ? "w-[68px]" : "w-[260px]"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-sidebar-border shrink-0">
        <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in overflow-hidden">
            <h1 className="font-bold text-sm leading-tight">Sarvam Finance</h1>
            <p className="text-[11px] text-sidebar-muted">Management Suite</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive ? "sidebar-link-active" : "sidebar-link-inactive"}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="animate-fade-in">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer — User info + Collapse + Logout */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {/* User info */}
        {user && !collapsed && (
          <div className="px-3 py-2 mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-xs font-bold shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{user.firstName} {user.lastName || ""}</p>
                <p className="text-[10px] text-sidebar-muted truncate">{user.role.displayName}</p>
              </div>
            </div>
          </div>
        )}
        <button
          onClick={onToggle}
          className="sidebar-link sidebar-link-inactive w-full"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          {!collapsed && <span>Collapse</span>}
        </button>
        <button onClick={handleLogout} className="sidebar-link sidebar-link-inactive w-full">
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}

