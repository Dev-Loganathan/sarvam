import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";

export interface Permission {
  id: string;
  code: string;
  module: string;
  description: string | null;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  isSystem: boolean;
  permissions: { permission: Permission }[];
  _count: { users: number };
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  mobile: string | null;
  isActive: boolean;
  roleId: string;
  role: { id: string; name: string; displayName: string };
  lastLoginAt: string | null;
  createdAt: string;
}

export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: async () => (await apiClient.get("/users")).data,
  });
}

export function useRoles() {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => (await apiClient.get("/users/roles/list")).data,
  });
}

export function usePermissions() {
  return useQuery<Permission[]>({
    queryKey: ["permissions"],
    queryFn: async () => (await apiClient.get("/users/permissions/list")).data,
  });
}

export function useUserMutations(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createUser = useMutation({
    mutationFn: async (data: any) => (await apiClient.post("/users", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User created" });
      onSuccess?.();
    },
    onError: (e: any) => {
      const msg = e.response?.data?.details?.join(", ") || e.response?.data?.error || "Failed to create user";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) =>
      (await apiClient.put(`/users/${id}`, data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User updated" });
      onSuccess?.();
    },
    onError: (e: any) => {
      const msg = e.response?.data?.error || "Failed to update user";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  const toggleUserStatus = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) =>
      (await apiClient.put(`/users/${id}`, { isActive })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({ title: "User status updated" });
    },
  });

  const resetPassword = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) =>
      (await apiClient.put(`/users/${id}/reset-password`, { password })).data,
    onSuccess: () => {
      toast({ title: "Password reset successfully" });
      onSuccess?.();
    },
    onError: (e: any) => {
      const msg = e.response?.data?.details?.join(", ") || e.response?.data?.error || "Failed to reset password";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  return { createUser, updateUser, toggleUserStatus, resetPassword };
}

export function useRoleMutations(onSuccess?: () => void) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const saveRole = useMutation({
    mutationFn: async ({ id, data }: { id?: string; data: any }) => {
      if (id) {
        return (await apiClient.put(`/users/roles/${id}`, data)).data;
      }
      return (await apiClient.post("/users/roles", data)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast({ title: "Role saved successfully" });
      onSuccess?.();
    },
    onError: (e: any) => {
      const msg = e.response?.data?.error || "Failed to save role";
      toast({ title: "Error", description: msg, variant: "destructive" });
    },
  });

  return { saveRole };
}
