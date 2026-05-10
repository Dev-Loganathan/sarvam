import { useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div
        className={`transition-all duration-300 ${collapsed ? "ml-[68px]" : "ml-[260px]"}`}
      >
        <TopNavbar />
        <main className="p-6 page-transition">{children}</main>
      </div>
    </div>
  );
}
