import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { dashboardService } from "~/services/admin/dashboard.service";
import { transactionsService } from "~/services/admin/transactions.service";
import type { DashboardStats, AdminTransactionSummary, UserGrowthPoint } from "~/types/admin";

const TTL_MS = 3 * 60 * 1000; // 3 minutes

interface DashboardState {
  stats: DashboardStats | null;
  growthData: UserGrowthPoint[];
  recentTransactions: AdminTransactionSummary[];
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  lastFetchedAt: number | null;

  fetch(): Promise<void>;
  refresh(): Promise<void>;
  clearAll(): void;
}

export const useAdminDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      stats: null,
      growthData: [],
      recentTransactions: [],
      isLoading: false,
      error: null,
      hasFetched: false,
      lastFetchedAt: null,

      fetch: async () => {
        const { hasFetched, lastFetchedAt } = get();
        const fresh = lastFetchedAt ? Date.now() - lastFetchedAt < TTL_MS : false;
        if (hasFetched || fresh) return;
        set({ isLoading: true, error: null });
        try {
          const [s, g, t] = await Promise.all([
            dashboardService.getStats(),
            dashboardService.getUserGrowth({ groupBy: "MONTH" }),
            transactionsService.list({ size: 8, sort: "createdAt,desc" }),
          ]);
          set({
            stats: s,
            growthData: g,
            recentTransactions: t.content,
            isLoading: false,
            hasFetched: true,
            lastFetchedAt: Date.now(),
          });
        } catch (err: unknown) {
          set({ error: (err as Error).message ?? "Erro ao carregar dashboard", isLoading: false });
        }
      },

      refresh: async () => {
        set({ isLoading: true, error: null, hasFetched: false });
        try {
          const [s, g, t] = await Promise.all([
            dashboardService.getStats(),
            dashboardService.getUserGrowth({ groupBy: "MONTH" }),
            transactionsService.list({ size: 8, sort: "createdAt,desc" }),
          ]);
          set({
            stats: s,
            growthData: g,
            recentTransactions: t.content,
            isLoading: false,
            hasFetched: true,
            lastFetchedAt: Date.now(),
          });
        } catch (err: unknown) {
          set({ error: (err as Error).message ?? "Erro ao actualizar dashboard", isLoading: false });
        }
      },

      clearAll: () => set({
        stats: null,
        growthData: [],
        recentTransactions: [],
        isLoading: false,
        error: null,
        hasFetched: false,
        lastFetchedAt: null,
      }),
    }),
    {
      name: "wundu-admin-dashboard-cache",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        stats: state.stats,
        growthData: state.growthData,
        recentTransactions: state.recentTransactions,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
);
