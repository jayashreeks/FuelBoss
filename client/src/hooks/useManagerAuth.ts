import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export function useManagerAuth() {
  const { data: manager, isLoading } = useQuery({
    queryKey: ["/api/auth/manager"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    manager,
    isLoading,
    isManagerAuthenticated: !!manager,
  };
}