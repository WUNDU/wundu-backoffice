import { api } from "~/lib/api";
import type { AdminTransactionDetail, AdminTransactionSummary, Page, TransactionListParams } from "~/types/admin";

const BASE = "/admin/transactions";

export interface TransactionExportParams {
  userId?: string;
  type?: "INCOME" | "EXPENSE";
  from?: string;
  to?: string;
}

export const transactionsService = {
  list(params?: TransactionListParams) {
    return api.get<Page<AdminTransactionSummary>>(BASE, { params }).then((r) => r.data);
  },

  get(transactionId: string) {
    return api.get<AdminTransactionDetail>(`${BASE}/${transactionId}`).then((r) => r.data);
  },

  exportCsv(params?: TransactionExportParams) {
    return api.get<Blob>(`${BASE}/exports`, { params, responseType: "blob" }).then((r) => r.data);
  },

  getAnomalies(params?: { page?: number; size?: number; sort?: string }) {
    return api.get<Page<AdminTransactionSummary>>(`${BASE}/anomalies`, { params }).then((r) => r.data);
  },

  delete(transactionId: string) {
    return api.delete<void>(`${BASE}/${transactionId}`).then((r) => r.data);
  },
};
