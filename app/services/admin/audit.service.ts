import { api } from "~/lib/api";
import type { AuditEntry, AuditListParams, Page } from "~/types/admin";

const BASE = "/admin/audit";

export const auditService = {
  list(params?: AuditListParams) {
    return api.get<Page<AuditEntry>>(BASE, { params }).then((r) => r.data);
  },

  export(params?: Omit<AuditListParams, "page" | "size">) {
    return api
      .get<Blob>(`${BASE}/export`, { params, responseType: "blob" })
      .then((r) => r.data);
  },
};
