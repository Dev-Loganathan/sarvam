import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import apiClient from '@/lib/api-client';

interface UserRole {
  id: string;
  name: string;
  displayName: string;
}

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string | null;
  role: UserRole;
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const accessTokenRef = useRef<string | null>(null);

  // Set up axios interceptor to attach access token
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use((config) => {
      if (accessTokenRef.current) {
        config.headers.Authorization = `Bearer ${accessTokenRef.current}`;
      }
      return config;
    });

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If 401 with TOKEN_EXPIRED and we haven't retried yet, try refreshing
        if (
          error.response?.status === 401 &&
          error.response?.data?.code === 'TOKEN_EXPIRED' &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            const refreshed = await refreshToken();
            if (refreshed) {
              originalRequest.headers.Authorization = `Bearer ${accessTokenRef.current}`;
              return apiClient(originalRequest);
            }
          } catch {
            // Refresh failed, user needs to log in again
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
      apiClient.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Try to restore session on app load
  useEffect(() => {
    refreshToken().finally(() => setIsLoading(false));
  }, []);

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await apiClient.post('/auth/refresh', {}, { withCredentials: true });
      accessTokenRef.current = response.data.accessToken;
      setUser(response.data.user);
      return true;
    } catch {
      accessTokenRef.current = null;
      setUser(null);
      return false;
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password }, { withCredentials: true });
    accessTokenRef.current = response.data.accessToken;
    setUser(response.data.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiClient.post('/auth/logout', {}, { withCredentials: true });
    } catch {
      // Even if server call fails, clear client state
    }
    accessTokenRef.current = null;
    setUser(null);
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
