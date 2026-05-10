import { Building2, Users, Shield, Percent, Database, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const settingSections = [
  { icon: Building2, title: "Company Profile", description: "Company name, address, logo, and contact details" },
  { icon: Users, title: "Staff Management", description: "Add, edit, or remove staff members" },
  { icon: Shield, title: "Role Permissions", description: "Configure access levels for each role" },
  { icon: Percent, title: "Interest Settings", description: "Default interest rates and calculation methods" },
  { icon: Database, title: "Backup & Restore", description: "Database backup and restore options" },
  { icon: Palette, title: "Theme Settings", description: "Customize appearance and branding" },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage application configuration</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingSections.map((section) => (
          <div key={section.title} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <section.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">{section.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{section.description}</p>
          </div>
        ))}
      </div>

      {/* Quick Company Settings */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h3 className="font-semibold mb-4">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Company Name</Label>
            <Input defaultValue="Sarvam Finance Pvt Ltd" />
          </div>
          <div className="space-y-2">
            <Label>Contact Number</Label>
            <Input defaultValue="+91 98765 43210" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input defaultValue="admin@sarvamfinance.com" />
          </div>
          <div className="space-y-2">
            <Label>GST Number</Label>
            <Input defaultValue="29AABCU9603R1ZM" />
          </div>
        </div>
        <Button className="mt-4">Save Changes</Button>
      </div>
    </div>
  );
}
