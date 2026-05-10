import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { Customer } from "@/lib/customer-types";

// Fetch customers from API
export function useCustomers() {
  const { data = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async (): Promise<Customer[]> => {
      const response = await apiClient.get('/customers');
      return response.data;
    }
  });

  return data;
}

// Fetch single customer by ID
export function useCustomer(id?: string) {
  return useQuery({
    queryKey: ['customers', id],
    queryFn: async (): Promise<Customer> => {
      const response = await apiClient.get(`/customers/${id}`);
      return response.data;
    },
    enabled: !!id
  });
}

// Create a new customer
export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<Customer>) => {
      const response = await apiClient.post('/customers', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  });
}

// Update a customer
export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Customer> }) => {
      const response = await apiClient.put(`/customers/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
    }
  });
}

// Update customer status
export function useUpdateCustomerStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status, reason, note }: { id: string; status: 'active' | 'inactive'; reason?: string; note?: string }) => {
      const response = await apiClient.patch(`/customers/${id}/status`, { status, inactiveReason: reason, inactiveNote: note });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
    }
  });
}
// Add a note
export function useAddNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, note }: { id: string; note: string }) => {
      const response = await apiClient.post(`/customers/${id}/notes`, { note });
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
    }
  });
}

// Add a document
export function useAddDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiClient.post(`/customers/${id}/documents`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
    }
  });
}

// Remove a document
export function useRemoveDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, docId }: { id: string; docId: string }) => {
      const response = await apiClient.delete(`/customers/${id}/documents/${docId}`);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['customers', id] });
    }
  });
}
