import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { goalsService } from "~/services/admin/goals.service";
import { queryKeys } from "~/lib/query-keys";

const STALE = 5 * 60 * 1000;
const PAGE_SIZE = 20;

export function useGoalsList(page: number) {
  return useQuery({
    queryKey: queryKeys.goals.list(page),
    queryFn: () => goalsService.list({ size: PAGE_SIZE, page }),
    staleTime: STALE,
    placeholderData: (prev) => prev,
  });
}

export function useGoalStats() {
  return useQuery({
    queryKey: queryKeys.goals.stats(),
    queryFn: () => goalsService.getStats(),
    staleTime: STALE,
  });
}

export function useDeleteGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => goalsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.goals.all });
    },
  });
}
