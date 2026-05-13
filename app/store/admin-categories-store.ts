import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { categoriesService } from "~/services/admin/categories.service";
import type { AdminCategory, CreateCategoryRequest, UpdateCategoryRequest } from "~/types/admin";

const TTL_MS = 30 * 60 * 1000; // 30 minutes — categories rarely change
const PAGE_SIZE = 20;

interface CategoriesState {
  items: AdminCategory[];
  totalElements: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  lastFetchedAt: number | null;

  fetch(page?: number): Promise<void>;
  refresh(page?: number): Promise<void>;
  create(body: CreateCategoryRequest): Promise<AdminCategory | null>;
  update(id: string, body: UpdateCategoryRequest): Promise<AdminCategory | null>;
  remove(id: string): Promise<boolean>;
  clearAll(): void;
}

export const useAdminCategoriesStore = create<CategoriesState>()(
  persist(
    (set, get) => ({
      items: [],
      totalElements: 0,
      totalPages: 0,
      isLoading: false,
      error: null,
      hasFetched: false,
      lastFetchedAt: null,

      fetch: async (page = 0) => {
        // Only skip refetch for the first page — subsequent pages always fetch
        if (page === 0) {
          const { hasFetched, lastFetchedAt } = get();
          const fresh = lastFetchedAt ? Date.now() - lastFetchedAt < TTL_MS : false;
          if (hasFetched || fresh) return;
        }
        set({ isLoading: true, error: null });
        try {
          const r = await categoriesService.list({ page, size: PAGE_SIZE });
          set({
            items: r.content,
            totalElements: r.totalElements,
            totalPages: r.totalPages,
            isLoading: false,
            hasFetched: page === 0,
            lastFetchedAt: page === 0 ? Date.now() : get().lastFetchedAt,
          });
        } catch (err: unknown) {
          set({ error: (err as Error).message ?? "Erro ao carregar categorias", isLoading: false });
        }
      },

      refresh: async (page = 0) => {
        set({ isLoading: true, error: null, hasFetched: false });
        try {
          const r = await categoriesService.list({ page, size: PAGE_SIZE });
          set({
            items: r.content,
            totalElements: r.totalElements,
            totalPages: r.totalPages,
            isLoading: false,
            hasFetched: true,
            lastFetchedAt: Date.now(),
          });
        } catch (err: unknown) {
          set({ error: (err as Error).message ?? "Erro ao actualizar categorias", isLoading: false });
        }
      },

      create: async (body) => {
        try {
          const created = await categoriesService.create(body);
          set((s) => ({ items: [created, ...s.items], totalElements: s.totalElements + 1 }));
          return created;
        } catch {
          return null;
        }
      },

      update: async (id, body) => {
        try {
          const updated = await categoriesService.update(id, body);
          set((s) => ({ items: s.items.map((c) => (c.id === id ? updated : c)) }));
          return updated;
        } catch {
          return null;
        }
      },

      remove: async (id) => {
        try {
          await categoriesService.delete(id);
          set((s) => ({ items: s.items.filter((c) => c.id !== id), totalElements: s.totalElements - 1 }));
          return true;
        } catch {
          return false;
        }
      },

      clearAll: () => set({
        items: [],
        totalElements: 0,
        totalPages: 0,
        isLoading: false,
        error: null,
        hasFetched: false,
        lastFetchedAt: null,
      }),
    }),
    {
      name: "wundu-admin-categories-cache",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        totalElements: state.totalElements,
        totalPages: state.totalPages,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
);
