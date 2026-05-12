import { api } from "~/lib/api";
import type { ClearCacheResponse } from "~/types/admin";

export const chatCacheService = {
  clear() {
    return api.delete<ClearCacheResponse>(`/admin/cache/chat`).then((r) => r.data);
  },
};
