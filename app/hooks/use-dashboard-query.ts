import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "~/services/admin/dashboard.service";
import { transactionsService } from "~/services/admin/transactions.service";
import { queryKeys } from "~/lib/query-keys";

const STALE = 3 * 60 * 1000;

export function useDashboardStats() {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => dashboardService.getStats(),
    staleTime: STALE,
  });
}

export function useDashboardGrowth() {
  return useQuery({
    queryKey: queryKeys.dashboard.growth({ groupBy: "MONTH" }),
    queryFn: () => dashboardService.getUserGrowth({ groupBy: "MONTH" }),
    staleTime: STALE,
  });
}

export function useDashboardRecentTransactions() {
  return useQuery({
    queryKey: queryKeys.dashboard.recentTransactions(),
    queryFn: () =>
      transactionsService
        .list({ size: 8, sort: "createdAt,desc" })
        .then((r) => r.content),
    staleTime: STALE,
  });
}
