import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { userService } from "~/services/admin/user.service";
import { adminsService } from "~/services/admin/admins.service";
import { queryKeys } from "~/lib/query-keys";
import type { AdminUserSummary, AdminSummary } from "~/types/admin";

const STALE = 5 * 60 * 1000;

export function useUsersList() {
  return useQuery({
    queryKey: queryKeys.users.list(),
    queryFn: () => userService.list({ size: 50 }).then((r) => r.content),
    staleTime: STALE,
  });
}

export function useAdminsList() {
  return useQuery({
    queryKey: queryKeys.users.admins(),
    queryFn: () => adminsService.list({ size: 50 }).then((r) => r.content),
    staleTime: STALE,
  });
}

export function useDeactivateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userService.deactivate(id),
    onSuccess: (_, id) => {
      qc.setQueryData<AdminUserSummary[]>(queryKeys.users.list(), (old = []) =>
        old.map((u) => (u.id === id ? { ...u, isActive: false } : u))
      );
    },
  });
}

export function useRevokeAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminsService.revoke(id),
    onSuccess: (_, id) => {
      qc.setQueryData<AdminSummary[]>(queryKeys.users.admins(), (old = []) =>
        old.filter((a) => a.id !== id)
      );
    },
  });
}
