import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authService } from "~/services/auth.service";
import { setAuthHandlers } from "~/lib/api";
import type { AdminProfile } from "~/services/auth.service";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  retryAfterSeconds: number | null;
  user: AdminProfile | null;

  initializeAuth(): Promise<void>;
  checkAuthStatus(): Promise<void>;
  refreshToken(): Promise<string>;
  login(email: string, password: string): Promise<boolean>;
  logout(): void;
  clearError(): void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
      retryAfterSeconds: null,
      user: null,

      checkAuthStatus: async () => {
        set({ isLoading: true });
        try {
          const { token } = get();
          if (!token) {
            set({ isLoading: false });
            return;
          }
          const user = await authService.getAdminProfile();
          if (user.role !== "ADMIN") {
            get().logout();
            return;
          }
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error: unknown) {
          const err = error as { name?: string; code?: string };
          if (err?.name === "AbortError" || err?.code === "ERR_CANCELED") {
            set({ isLoading: false });
            return;
          }
          set({ token: null, isAuthenticated: false, isLoading: false, user: null });
        }
      },

      // Silent refresh on startup — if refresh cookie is still valid, backend issues new accessToken
      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const { accessToken } = await authService.refresh();
          set({ token: accessToken });
          await get().checkAuthStatus();
        } catch {
          set({ token: null, isAuthenticated: false, isLoading: false, user: null });
        }
      },

      refreshToken: async () => {
        const { accessToken } = await authService.refresh();
        set({ token: accessToken, isAuthenticated: true });
        return accessToken;
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null, retryAfterSeconds: null });
        try {
          const response = await authService.login(email, password);
          // Store token but don't mark as authenticated yet — wait for role verification
          set({ token: response.accessToken });
          await get().checkAuthStatus();

          // checkAuthStatus sets isAuthenticated: true only for ADMIN users
          // If not ADMIN or profile fetch failed, isAuthenticated stays false
          if (!get().isAuthenticated) {
            if (!get().error) {
              set({
                error: "Acesso restrito. Apenas administradores podem entrar.",
                isLoading: false,
              });
            }
            return false;
          }

          return true;
        } catch (error: unknown) {
          const err = error as { errorCode?: string; retryAfterSeconds?: number; status?: number };

          let errMsg: string;
          if (err?.errorCode === "TOO_MANY_ATTEMPTS") {
            errMsg = "Demasiadas tentativas. Aguarde antes de tentar novamente.";
            set({ error: errMsg, isLoading: false, retryAfterSeconds: err?.retryAfterSeconds ?? 900 });
          } else if (err?.errorCode === "ACCOUNT_DISABLED") {
            errMsg = "A sua conta foi desactivada. Contacte o suporte.";
            set({ error: errMsg, isLoading: false });
          } else {
            errMsg =
              (error as Error)?.message ||
              (err?.status === 500
                ? "Não foi possível aceder ao sistema. Tente mais tarde."
                : "Credenciais inválidas");
            set({ error: errMsg, isLoading: false });
          }
          return false;
        }
      },

      logout: () => {
        authService.logoutApi().catch(() => {});
        set({ token: null, isAuthenticated: false, isLoading: false, error: null, user: null });
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      },

      clearError: () => set({ error: null, retryAfterSeconds: null }),
    }),
    {
      name: "wundu-admin-cache",
      storage: createJSONStorage(() => localStorage),
      // Token stays in-memory only — never persisted (XSS protection)
      // User profile persisted for instant display while silent refresh runs
      partialize: (state) => ({ user: state.user }),
      // Skip auto-hydration to prevent SSR/client mismatch — rehydrate manually in useEffect
      skipHydration: true,
    }
  )
);

// Register token/refresh/logout handlers with the axios client
// This breaks the circular dep: auth-store → api → auth-store
setAuthHandlers(
  () => useAuthStore.getState().token,
  () => useAuthStore.getState().refreshToken(),
  () => useAuthStore.getState().logout()
);
