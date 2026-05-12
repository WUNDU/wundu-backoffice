import { api } from "~/lib/api";
import type {
  AdminNotification,
  BroadcastRequest,
  BroadcastResponse,
  NotificationListParams,
  NotificationStats,
  Page,
} from "~/types/admin";

const BASE = "/admin/notifications";

export const notificationsService = {
  list(params?: NotificationListParams) {
    return api.get<Page<AdminNotification>>(BASE, { params }).then((r) => r.data);
  },

  getStats() {
    return api.get<NotificationStats>(`${BASE}/stats`).then((r) => r.data);
  },

  broadcast(body: BroadcastRequest) {
    return api.post<BroadcastResponse>(`${BASE}/broadcast`, body).then((r) => r.data);
  },
};
