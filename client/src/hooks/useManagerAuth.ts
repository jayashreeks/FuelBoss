import { useQuery } from "@tanstack/react-query";

export function useManagerAuth() {
  const { data: manager, isLoading } = useQuery({
    queryKey: ["/api/auth/manager"],
    retry: false,
  });

  return {
    manager,
    isLoading,
    isManagerAuthenticated: !!manager,
  };
}