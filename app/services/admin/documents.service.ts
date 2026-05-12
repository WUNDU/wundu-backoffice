import { api } from "~/lib/api";
import type { AdminDocumentDetail, AdminDocumentSummary, DocumentListParams, OcrStats, Page } from "~/types/admin";

const BASE = "/admin/documents";

export const documentsService = {
  list(params?: DocumentListParams) {
    return api.get<Page<AdminDocumentSummary>>(BASE, { params }).then((r) => r.data);
  },

  get(documentId: string) {
    return api.get<AdminDocumentDetail>(`${BASE}/${documentId}`).then((r) => r.data);
  },

  delete(documentId: string) {
    return api.delete<void>(`${BASE}/${documentId}`).then((r) => r.data);
  },

  reprocess(documentId: string) {
    return api.post<void>(`${BASE}/${documentId}/reprocess`).then((r) => r.data);
  },

  getStats() {
    return api.get<OcrStats>(`${BASE}/stats`).then((r) => r.data);
  },
};
