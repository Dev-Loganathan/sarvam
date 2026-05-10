import { Bell, Search, User as UserIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

export function TopNavbar() {
  const { user } = useAuth();

  const initials = user
    ? `${user.firstName[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase()
    : "";

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search customers, loans, chits..." className="pl-9 bg-secondary/50 border-0" />
      </div>
      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
          <Bell className="w-5 h-5 text-muted-foreground" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium">{user ? `${user.firstName} ${user.lastName || ""}` : "Loading..."}</p>
            <p className="text-xs text-muted-foreground">{user?.role.displayName || "..."}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            {initials ? (
              <span className="text-xs font-bold text-primary">{initials}</span>
            ) : (
              <UserIcon className="w-4 h-4 text-primary" />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
