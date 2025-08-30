import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { User } from '@/types';

export function useAuth() {
  const queryClient = useQueryClient();

  // 1. Explicitly type the data returned by the useQuery hook.
  //    This tells TypeScript that 'user' will be of type 'User' or 'null'
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const login = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  const logout = async () => {
    try {
      // 2. Add 'VITE_API_URL' to your tsconfig.json types.
      //    This resolves the 'Property 'env' does not exist on type 'ImportMeta'' error.
      const API_BASE = import.meta.env.VITE_API_URL || '';
      await fetch(`${API_BASE}/api/logout`, {
        method: "POST",
        credentials: "include"
      });
      queryClient.clear();
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}