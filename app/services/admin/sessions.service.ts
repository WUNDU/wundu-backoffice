import { api } from "~/lib/api";
import type { AdminSession, Page } from "~/types/admin";

const BASE = "/admin/sessions";

export const sessionsService = {
  list(params?: { userId?: string; page?: number; size?: number }) {
    return api.get<Page<AdminSession>>(BASE, { params }).then((r) => r.data);
  },

  revoke(tokenId: string) {
    return api.delete<void>(`${BASE}/${tokenId}`).then((r) => r.data);
  },
};
