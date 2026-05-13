import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { goalsService } from "~/services/admin/goals.service";
import type { AdminGoal, GoalStats } from "~/types/admin";

const TTL_MS = 5 * 60 * 1000; // 5 minutes
const PAGE_SIZE = 20;

interface GoalsState {
  items: AdminGoal[];
  totalElements: number;
  totalPages: number;
  stats: GoalStats | null;
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  lastFetchedAt: number | null;

  fetch(page?: number): Promise<void>;
  refresh(page?: number): Promise<void>;
  remove(id: string): void;
  clearAll(): void;
}

export const useAdminGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      items: [],
      totalElements: 0,
      totalPages: 0,
      stats: null,
      isLoading: false,
      error: null,
      hasFetched: false,
      lastFetchedAt: null,

      fetch: async (page = 0) => {
        if (page === 0) {
          const { hasFetched, lastFetchedAt } = get();
          const fresh = lastFetchedAt ? Date.now() - lastFetchedAt < TTL_MS : false;
          if (hasFetched || fresh) return;
        }
        set({ isLoading: true, error: null });
        try {
          const [r, s] = await Promise.all([
            goalsService.list({ size: PAGE_SIZE, page }),
            page === 0 ? goalsService.getStats() : Promise.resolve(get().stats),
          ]);
          set({
            items: r.content,
            totalElements: r.totalElements,
            totalPages: r.totalPages,
            stats: s,
            isLoading: false,
            hasFetched: page === 0,
            lastFetchedAt: page === 0 ? Date.now() : get().lastFetchedAt,
          });
        } catch (err: unknown) {
          set({ error: (err as Error).message ?? "Erro ao carregar metas", isLoading: false });
        }
      },

      refresh: async (page = 0) => {
        set({ isLoading: true, error: null, hasFetched: false });
        try {
          const [r, s] = await Promise.all([
            goalsService.list({ size: PAGE_SIZE, page }),
            goalsService.getStats(),
          ]);
          set({
            items: r.content,
            totalElements: r.totalElements,
            totalPages: r.totalPages,
            stats: s,
            isLoading: false,
            hasFetched: true,
            lastFetchedAt: Date.now(),
          });
        } catch (err: unknown) {
          set({ error: (err as Error).message ?? "Erro ao actualizar metas", isLoading: false });
        }
      },

      remove: (id) => {
        set((s) => ({
          items: s.items.filter((g) => g.id !== id),
          totalElements: Math.max(0, s.totalElements - 1),
        }));
      },

      clearAll: () => set({
        items: [],
        totalElements: 0,
        totalPages: 0,
        stats: null,
        isLoading: false,
        error: null,
        hasFetched: false,
        lastFetchedAt: null,
      }),
    }),
    {
      name: "wundu-admin-goals-cache",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        totalElements: state.totalElements,
        totalPages: state.totalPages,
        stats: state.stats,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
);
