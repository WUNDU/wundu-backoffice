import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { transactionsService } from "~/services/admin/transactions.service";
import { queryKeys } from "~/lib/query-keys";
import type { TransactionListParams } from "~/types/admin";

const STALE = 3 * 60 * 1000;
const PAGE_SIZE = 50;

export function useTransactionsList(
  type: "" | "INCOME" | "EXPENSE",
  page: number,
  extraParams?: Partial<TransactionListParams>
) {
  return useQuery({
    queryKey: queryKeys.transactions.list(type, page),
    queryFn: () => {
      const params: TransactionListParams = {
        size: PAGE_SIZE,
        page,
        sort: "createdAt,desc",
        ...extraParams,
      };
      if (type) params.type = type;
      return transactionsService.list(params);
    },
    staleTime: STALE,
    placeholderData: (prev) => prev,
  });
}

export function useDeleteTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.transactions.all });
    },
  });
}
