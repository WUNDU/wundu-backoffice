import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { userService } from "~/services/admin/user.service";
import { adminsService } from "~/services/admin/admins.service";
import type { AdminUserSummary, AdminSummary } from "~/types/admin";

const TTL_MS = 5 * 60 * 1000; // 5 minutes

interface UsersState {
  users: AdminUserSummary[];
  admins: AdminSummary[];
  isLoading: boolean;
  error: string | null;
  hasFetched: boolean;
  lastFetchedAt: number | null;

  fetch(): Promise<void>;
  refresh(): Promise<void>;
  deactivateUser(id: string): Promise<boolean>;
  revokeAdmin(id: string): Promise<boolean>;
  clearAll(): void;
}

export const useAdminUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
      users: [],
      admins: [],
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
          const [u, a] = await Promise.all([
            userService.list({ size: 50 }),
            adminsService.list({ size: 50 }),
          ]);
          set({
            users: u.content,
            admins: a.content,
            isLoading: false,
            hasFetched: true,
            lastFetchedAt: Date.now(),
          });
        } catch (err: unknown) {
          set({ error: (err as Error).message ?? "Erro ao carregar utilizadores", isLoading: false });
        }
      },

      refresh: async () => {
        set({ isLoading: true, error: null, hasFetched: false });
        try {
          const [u, a] = await Promise.all([
            userService.list({ size: 50 }),
            adminsService.list({ size: 50 }),
          ]);
          set({
            users: u.content,
            admins: a.content,
            isLoading: false,
            hasFetched: true,
            lastFetchedAt: Date.now(),
          });
        } catch (err: unknown) {
          set({ error: (err as Error).message ?? "Erro ao actualizar utilizadores", isLoading: false });
        }
      },

      deactivateUser: async (id) => {
        try {
          await userService.deactivate(id);
          set((s) => ({
            users: s.users.map((u) => u.id === id ? { ...u, isActive: false } : u),
          }));
          return true;
        } catch {
          return false;
        }
      },

      revokeAdmin: async (id) => {
        try {
          await adminsService.revoke(id);
          set((s) => ({ admins: s.admins.filter((a) => a.id !== id) }));
          return true;
        } catch {
          return false;
        }
      },

      clearAll: () => set({
        users: [],
        admins: [],
        isLoading: false,
        error: null,
        hasFetched: false,
        lastFetchedAt: null,
      }),
    }),
    {
      name: "wundu-admin-users-cache",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        users: state.users,
        admins: state.admins,
        lastFetchedAt: state.lastFetchedAt,
      }),
    }
  )
);
