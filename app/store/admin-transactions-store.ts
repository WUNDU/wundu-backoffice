import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { transactionsService } from "~/services/admin/transactions.service";
import type { AdminTransactionSummary, TransactionListParams } from "~/types/admin";

const TTL_MS = 3 * 60 * 1000; // 3 minutes
const PAGE_SIZE = 50;

interface PagedResult {
  items: AdminTransactionSummary[];
  totalElements: number;
  totalPages: number;
  lastFetchedAt: number | null;
}

const emptyPage = (): PagedResult => ({
  items: [],
  totalElements: 0,
  totalPages: 0,
  lastFetchedAt: null,
});

interface TransactionsState {
  all: PagedResult;
  income: PagedResult;
  expense: PagedResult;
  isLoading: boolean;
  error: string | null;

  fetch(type: "" | "INCOME" | "EXPENSE", page?: number, extraParams?: Partial<TransactionListParams>): Promise<void>;
  refresh(type: "" | "INCOME" | "EXPENSE", page?: number, extraParams?: Partial<TransactionListParams>): Promise<void>;
  deleteItem(id: string): void;
  clearAll(): void;
}

function getSlot(state: TransactionsState, type: "" | "INCOME" | "EXPENSE"): PagedResult {
  if (type === "INCOME") return state.income;
  if (type === "EXPENSE") return state.expense;
  return state.all;
}

function setSlot(type: "" | "INCOME" | "EXPENSE", data: Partial<PagedResult>) {
  if (type === "INCOME") return { income: { ...emptyPage(), ...data } };
  if (type === "EXPENSE") return { expense: { ...emptyPage(), ...data } };
  return { all: { ...emptyPage(), ...data } };
}

export const useAdminTransactionsStore = create<TransactionsState>()(
  persist(
    (set, get) => ({
      all: emptyPage(),
      income: emptyPage(),
      expense: emptyPage(),
      isLoading: false,
      error: null,

      fetch: async (type, page = 0, extraParams = {}) => {
        if (page === 0) {
          const slot = getSlot(get(), type);
          const fresh = slot.lastFetchedAt ? Date.now() - slot.lastFetchedAt < TTL_MS : false;
          if (fresh && slot.items.length > 0) return;
        }
        set({ isLoading: true, error: null });
        try {
          const params: TransactionListParams = {
            size: PAGE_SIZE,
            page,
            sort: "createdAt,desc",
            ...extraParams,
          };
          if (type) params.type = type;
          const r = await transactionsService.list(params);
          set((s) => ({
            ...setSlot(type, {
              items: r.content,
              totalElements: r.totalElements,
              totalPages: r.totalPages,
              lastFetchedAt: page === 0 ? Date.now() : getSlot(s, type).lastFetchedAt,
            }),
            isLoading: false,
          }));
        } catch (err: unknown) {
          set({ error: (err as Error).message ?? "Erro ao carregar transacções", isLoading: false });
        }
      },

      refresh: async (type, page = 0, extraParams = {}) => {
        set({ isLoading: true, error: null });
        try {
          const params: TransactionListParams = {
            size: PAGE_SIZE,
            page,
            sort: "createdAt,desc",
            ...extraParams,
          };
          if (type) params.type = type;
          const r = await transactionsService.list(params);
          set({
            ...setSlot(type, {
              items: r.content,
              totalElements: r.totalElements,
              totalPages: r.totalPages,
              lastFetchedAt: Date.now(),
            }),
            isLoading: false,
          });
        } catch (err: unknown) {
          set({ error: (err as Error).message ?? "Erro ao actualizar transacções", isLoading: false });
        }
      },

      deleteItem: (id) => {
        set((s) => ({
          all: { ...s.all, items: s.all.items.filter((t) => t.id !== id) },
          income: { ...s.income, items: s.income.items.filter((t) => t.id !== id) },
          expense: { ...s.expense, items: s.expense.items.filter((t) => t.id !== id) },
        }));
      },

      clearAll: () => set({
        all: emptyPage(),
        income: emptyPage(),
        expense: emptyPage(),
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: "wundu-admin-transactions-cache",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        all: state.all,
        income: state.income,
        expense: state.expense,
      }),
    }
  )
);
