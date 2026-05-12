import { api } from "~/lib/api";
import type { AdminSummary, Page, PromoteAdminRequest } from "~/types/admin";

const BASE = "/admin/admins";

export const adminsService = {
  list(params?: { page?: number; size?: number }) {
    return api.get<Page<AdminSummary>>(BASE, { params }).then((r) => r.data);
  },

  promote(body: PromoteAdminRequest) {
    return api.post<void>(`${BASE}/promote`, body).then((r) => r.data);
  },

  revoke(adminId: string) {
    return api.post<void>(`${BASE}/${adminId}/revoke`).then((r) => r.data);
  },
};
