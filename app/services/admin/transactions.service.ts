import { api } from "~/lib/api";
import type { AdminTransactionDetail, AdminTransactionSummary, Page, TransactionListParams } from "~/types/admin";

const BASE = "/admin/transactions";

export const transactionsService = {
  list(params?: TransactionListParams) {
    return api.get<Page<AdminTransactionSummary>>(BASE, { params }).then((r) => r.data);
  },

  get(transactionId: string) {
    return api.get<AdminTransactionDetail>(`${BASE}/${transactionId}`).then((r) => r.data);
  },

  delete(transactionId: string) {
    return api.delete<void>(`${BASE}/${transactionId}`).then((r) => r.data);
  },
};
