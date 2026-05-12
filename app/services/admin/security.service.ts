import { api } from "~/lib/api";
import type { LoginAttempt } from "~/types/admin";

const BASE = "/admin/security";

export const securityService = {
  getLoginAttempts() {
    return api.get<LoginAttempt[]>(`${BASE}/login-attempts`).then((r) => r.data);
  },

  getBlocked() {
    return api.get<LoginAttempt[]>(`${BASE}/blocked`).then((r) => r.data);
  },

  unblock(key: string) {
    return api.post<void>(`${BASE}/unblock`, { key }).then((r) => r.data);
  },
};
