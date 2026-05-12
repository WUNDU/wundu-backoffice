import { api } from "~/lib/api";
import type { ClearCacheResponse } from "~/types/admin";

const BASE = "/admin/chat-cache";

export const chatCacheService = {
  clear() {
    return api.post<ClearCacheResponse>(`${BASE}/clear`).then((r) => r.data);
  },
};
