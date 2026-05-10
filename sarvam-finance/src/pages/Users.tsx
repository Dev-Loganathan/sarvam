import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  UserPlus, Edit2, ShieldCheck, ShieldOff, KeyRound, Search,
  Users as UsersIcon, Shield, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";
import {
  User, Role, Permission,
  useUsers, useRoles, usePermissions,
  useUserMutations, useRoleMutations
} from "@/hooks/use-users";

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
  <Label className="text-xs">
    {children} <span className="text-destructive">*</span>
  </Label>
);

// ─── Users Page ───────────────────────────────────────────────

export default function Users() {
  const { hasPermission } = useAuth();
  const { data: users = [], isLoading } = useUsers();
  const { data: roles = [] } = useRoles();
  const [search, setSearch] = useState("");
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [tab, setTab] = useState<"users" | "roles">("users");

  const { createUser, updateUser, toggleUserStatus, resetPassword } = useUserMutations(() => {
    setShowUserDialog(false);
    setEditingUser(null);
  });

  const filteredUsers = users.filter((u) =>
    `${u.firstName} ${u.lastName || ""} ${u.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage users, roles, and permissions</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={tab === "users" ? "default" : "outline"}
          onClick={() => setTab("users")}
          className="gap-2"
        >
          <UsersIcon className="w-4 h-4" /> Users
        </Button>
        {hasPermission("user:manage_roles") && (
          <Button
            variant={tab === "roles" ? "default" : "outline"}
            onClick={() => setTab("roles")}
            className="gap-2"
          >
            <Shield className="w-4 h-4" /> Roles & Permissions
          </Button>
        )}
      </div>

      {tab === "users" ? (
        <UsersTab
          users={filteredUsers}
          roles={roles}
          search={search}
          setSearch={setSearch}
          isLoading={isLoading}
          hasPermission={hasPermission}
          onCreateUser={() => { setEditingUser(null); setShowUserDialog(true); }}
          onEditUser={(u) => { setEditingUser(u); setShowUserDialog(true); }}
          onToggleStatus={(u) => toggleUserStatus.mutate({ id: u.id, isActive: !u.isActive })}
          onResetPassword={(id, pw) => resetPassword.mutate({ id, password: pw })}
        />
      ) : (
        <RolesTab
          roles={roles}
          hasPermission={hasPermission}
          onEditRole={(r) => { setEditingRole(r); setShowRoleDialog(true); }}
          onCreateRole={() => { setEditingRole(null); setShowRoleDialog(true); }}
        />
      )}

      {/* User Dialog */}
      <UserDialog
        open={showUserDialog}
        onOpenChange={setShowUserDialog}
        user={editingUser}
        roles={roles}
        onSave={(data) => {
          if (editingUser) {
            updateUser.mutate({ id: editingUser.id, data });
          } else {
            createUser.mutate(data);
          }
        }}
        isPending={createUser.isPending || updateUser.isPending}
      />

      {/* Role Dialog */}
      <RoleDialog
        open={showRoleDialog}
        onOpenChange={setShowRoleDialog}
        role={editingRole}
      />
    </div>
  );
}

// ─── Users Tab ────────────────────────────────────────────────

function UsersTab({
  users, roles, search, setSearch, isLoading, hasPermission,
  onCreateUser, onEditUser, onToggleStatus, onResetPassword,
}: {
  users: User[];
  roles: Role[];
  search: string;
  setSearch: (s: string) => void;
  isLoading: boolean;
  hasPermission: (p: string) => boolean;
  onCreateUser: () => void;
  onEditUser: (u: User) => void;
  onToggleStatus: (u: User) => void;
  onResetPassword: (id: string, pw: string) => void;
}) {
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {hasPermission("user:create") && (
          <Button onClick={onCreateUser} className="gap-2">
            <UserPlus className="w-4 h-4" /> Add User
          </Button>
        )}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Last Login</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-border last:border-0">
                    <td className="p-3">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </td>
                    <td className="p-3"><Skeleton className="h-5 w-20 rounded-md" /></td>
                    <td className="p-3"><Skeleton className="h-5 w-16 rounded-md" /></td>
                    <td className="p-3"><Skeleton className="h-4 w-28" /></td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Skeleton className="w-8 h-8 rounded-md" />
                        <Skeleton className="w-8 h-8 rounded-md" />
                        <Skeleton className="w-8 h-8 rounded-md" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : users.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 text-sm">No users found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left p-3 font-medium">User</th>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Last Login</th>
                <th className="text-right p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <p className="font-medium">{u.firstName} {u.lastName || ""}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{u.role.displayName}</Badge>
                  </td>
                  <td className="p-3">
                    <Badge variant={u.isActive ? "default" : "destructive"}>
                      {u.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-IN") : "Never"}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {hasPermission("user:edit") && (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="sm" variant="ghost" onClick={() => onEditUser(u)}>
                                <Edit2 className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit User</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onToggleStatus(u)}
                              >
                                {u.isActive ? (
                                  <ShieldOff className="w-3.5 h-3.5 text-destructive" />
                                ) : (
                                  <ShieldCheck className="w-3.5 h-3.5 text-success" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {u.isActive ? "Deactivate User" : "Activate User"}
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => { setResetUserId(u.id); setNewPw(""); }}
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reset Password</TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={!!resetUserId} onOpenChange={() => setResetUserId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label>New Password</Label>
            <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="Enter new password" />
            <p className="text-xs text-muted-foreground">
              Min 12 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character. No sequential or repeated characters.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetUserId(null)}>Cancel</Button>
            <Button onClick={() => { if (resetUserId) { onResetPassword(resetUserId, newPw); setResetUserId(null); } }}>
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── User Dialog ──────────────────────────────────────────────

function UserDialog({
  open, onOpenChange, user, roles, onSave, isPending,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user: User | null;
  roles: Role[];
  onSave: (data: any) => void;
  isPending: boolean;
}) {
  const isEdit = !!user;
  const [form, setForm] = useState({
    email: "", password: "", firstName: "", lastName: "", mobile: "", roleId: "",
  });

  useEffect(() => {
    if (open) {
      if (user) {
        setForm({
          email: user.email,
          password: "",
          firstName: user.firstName,
          lastName: user.lastName || "",
          mobile: user.mobile || "",
          roleId: user.roleId,
        });
      } else {
        setForm({
          email: "",
          password: "",
          firstName: "",
          lastName: "",
          mobile: "",
          roleId: roles[0]?.id || "",
        });
      }
    }
  }, [open, user, roles]);

  const hasChanges = () => {
    if (!user) return true; // Always allow save for new user (mandatory check is separate)
    return (
      form.firstName !== user.firstName ||
      form.lastName !== (user.lastName || "") ||
      form.mobile !== (user.mobile || "") ||
      form.roleId !== user.roleId
    );
  };

  const canSave = !isEdit ? (form.firstName && form.email && form.password && form.mobile && form.roleId) : hasChanges();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Create User"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <RequiredLabel>First Name</RequiredLabel>
              <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Last Name</Label>
              <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <RequiredLabel>Email</RequiredLabel>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={isEdit} />
          </div>
          {!isEdit && (
            <div className="space-y-1.5">
              <RequiredLabel>Password</RequiredLabel>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              <p className="text-[10px] text-muted-foreground">
                Min 12 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
              </p>
            </div>
          )}
          <div className="space-y-1.5">
            <RequiredLabel>Mobile</RequiredLabel>
            <Input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <RequiredLabel>Role</RequiredLabel>
            <Select value={form.roleId} onValueChange={(v) => setForm({ ...form, roleId: v })}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.displayName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={() => onSave(isEdit ? { firstName: form.firstName, lastName: form.lastName, mobile: form.mobile, roleId: form.roleId } : form)}
            disabled={isPending || !canSave}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Roles Tab ────────────────────────────────────────────────

function RolesTab({
  roles, hasPermission, onEditRole, onCreateRole,
}: {
  roles: Role[];
  hasPermission: (p: string) => boolean;
  onEditRole: (r: Role) => void;
  onCreateRole: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Roles</h3>
        {hasPermission("user:manage_roles") && (
          <Button onClick={onCreateRole} variant="outline" size="sm" className="gap-2">
            <Shield className="w-4 h-4" /> New Role
          </Button>
        )}
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <div key={role.id} className="bg-card rounded-xl border border-border p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold">{role.displayName}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{role.description}</p>
              </div>
              {role.isSystem && <Badge variant="outline" className="text-[10px]">System</Badge>}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{role.permissions.length} permissions</span>
              <span>·</span>
              <span>{role._count.users} users</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {role.permissions.slice(0, 6).map((rp) => (
                <Badge key={rp.permission.id} variant="secondary" className="text-[10px]">
                  {rp.permission.code}
                </Badge>
              ))}
              {role.permissions.length > 6 && (
                <Badge variant="secondary" className="text-[10px]">+{role.permissions.length - 6} more</Badge>
              )}
            </div>
            {hasPermission("user:manage_roles") && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full gap-2" onClick={() => onEditRole(role)}>
                    <Edit2 className="w-3.5 h-3.5" /> Edit Permissions
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Configure role permissions</TooltipContent>
              </Tooltip>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Role Dialog ──────────────────────────────────────────────

function RoleDialog({
  open, onOpenChange, role,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  role: Role | null;
}) {
  const { data: allPermissions = [] } = usePermissions();
  const isEdit = !!role;

  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

  const { saveRole } = useRoleMutations(() => onOpenChange(false));

  useEffect(() => {
    if (open) {
      if (role) {
        setName(role.name);
        setDisplayName(role.displayName);
        setDescription(role.description || "");
        setSelectedPerms(new Set(role.permissions.map((rp) => rp.permission.id)));
      } else {
        setName("");
        setDisplayName("");
        setDescription("");
        setSelectedPerms(new Set());
      }
    }
  }, [open, role]);

  const hasChanges = () => {
    if (!role) return true;
    const initialPerms = new Set(role.permissions.map(rp => rp.permission.id));
    const permsChanged = selectedPerms.size !== initialPerms.size || 
                         Array.from(selectedPerms).some(p => !initialPerms.has(p));
    
    return (
      displayName !== role.displayName ||
      description !== (role.description || "") ||
      permsChanged
    );
  };

  const canSave = !isEdit ? (displayName && selectedPerms.size > 0) : hasChanges();

  const togglePerm = (permId: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) next.delete(permId);
      else next.add(permId);
      return next;
    });
  };

  const onSave = () => {
    saveRole.mutate({
      id: role?.id,
      data: {
        name,
        displayName,
        description,
        permissionIds: Array.from(selectedPerms),
      }
    });
  };

  // Group permissions by module
  const permsByModule = allPermissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {} as Record<string, typeof allPermissions>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit Role: ${role?.displayName}` : "Create Role"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <RequiredLabel>Role Name</RequiredLabel>
              <Input
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  if (!isEdit) {
                    setName(e.target.value.toLowerCase().replace(/\s+/g, "_"));
                  }
                }}
                placeholder="e.g. Branch Manager"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What can this role do?" />
            </div>
          </div>
          <div>
            <Label className="text-xs mb-3 block">Permissions</Label>
            <div className="space-y-4">
              {Object.entries(permsByModule).map(([module, perms]) => (
                <div key={module} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold capitalize">{module}</p>
                    <button
                      type="button"
                      className="text-[10px] text-primary hover:underline"
                      onClick={() => {
                        const allSelected = perms.every((p) => selectedPerms.has(p.id));
                        setSelectedPerms((prev) => {
                          const next = new Set(prev);
                          perms.forEach((p) => allSelected ? next.delete(p.id) : next.add(p.id));
                          return next;
                        });
                      }}
                    >
                      {perms.every((p) => selectedPerms.has(p.id)) ? "Deselect All" : "Select All"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {perms.map((p) => (
                      <label key={p.id} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-muted/50 rounded p-1.5">
                        <input
                          type="checkbox"
                          checked={selectedPerms.has(p.id)}
                          onChange={() => togglePerm(p.id)}
                          className="rounded"
                        />
                        <span className="font-mono text-[11px]">{p.code}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave()} disabled={saveRole.isPending || !canSave}>
            {saveRole.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
