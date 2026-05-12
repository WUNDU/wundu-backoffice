import { api } from "~/lib/api";
import type { DashboardStats, UserGrowthPoint } from "~/types/admin";

const BASE = "/admin/dashboard";

export const dashboardService = {
  getStats() {
    return api.get<DashboardStats>(`${BASE}/stats`).then((r) => r.data);
  },

  getUserGrowth(params?: { from?: string; to?: string; groupBy?: "DAY" | "WEEK" | "MONTH" }) {
    return api.get<UserGrowthPoint[]>(`${BASE}/user-growth`, { params }).then((r) => r.data);
  },
};
