import { api } from "~/lib/api";
import type { SystemHealth, SystemInfo, SystemMetrics } from "~/types/admin";

const BASE = "/admin/system";

export const systemService = {
  getHealth() {
    return api.get<SystemHealth>(`${BASE}/health`).then((r) => r.data);
  },

  getInfo() {
    return api.get<SystemInfo>(`${BASE}/info`).then((r) => r.data);
  },

  getMetrics() {
    return api.get<SystemMetrics>(`${BASE}/metrics`).then((r) => r.data);
  },
};
