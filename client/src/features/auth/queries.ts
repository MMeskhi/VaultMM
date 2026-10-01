import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSession, logout } from "./api";

export const sessionKey = ["auth", "session"] as const;

export function useSession(enabled = true) {
  return useQuery({
    queryKey: sessionKey,
    enabled,
    queryFn: ({ signal }) => getSession(signal),
    // The session endpoint also creates a vault; avoid background creation requests.
    staleTime: Infinity,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      await queryClient.cancelQueries();
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== "auth",
      });
      queryClient.setQueryData(sessionKey, null);
    },
  });
}
