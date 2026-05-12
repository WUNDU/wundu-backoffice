import { api } from "~/lib/api";
import type { AdminGoal, GoalListParams, GoalStats, Page } from "~/types/admin";

const BASE = "/admin/goals";

export const goalsService = {
  list(params?: GoalListParams) {
    return api.get<Page<AdminGoal>>(BASE, { params }).then((r) => r.data);
  },

  get(goalId: string) {
    return api.get<AdminGoal>(`${BASE}/${goalId}`).then((r) => r.data);
  },

  delete(goalId: string) {
    return api.delete<void>(`${BASE}/${goalId}`).then((r) => r.data);
  },

  getStats() {
    return api.get<GoalStats>(`${BASE}/stats`).then((r) => r.data);
  },
};
