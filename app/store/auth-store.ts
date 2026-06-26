import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { authService } from "~/services/auth.service";
import { setAuthHandlers } from "~/lib/api";
import { queryClient } from "~/lib/query-client";
import type { AdminProfile } from "~/services/auth.service";

// Shared init promise — prevents initializeAuth and refreshToken from racing
// over the same single-use refresh token (token rotates on each use)
let _initPromise: Promise<void> | null = null;

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
        // Deduplicate: if already running, return the same promise (prevents double-call on StrictMode)
        if (_initPromise) return _initPromise;
        set({ isLoading: true });
        _initPromise = (async () => {
          try {
            const { accessToken } = await authService.refresh();
            set({ token: accessToken });
            await get().checkAuthStatus();
          } catch {
            set({ token: null, isAuthenticated: false, isLoading: false, user: null });
          } finally {
            _initPromise = null;
          }
        })();
        return _initPromise;
      },

      // Called by axios interceptor on 401 — waits for initializeAuth if in progress
      // to avoid competing for the same single-use refresh token.
      // If initializeAuth is running and we already have a token in memory (set before
      // checkAuthStatus), return it immediately — avoids a deadlock where checkAuthStatus
      // triggers a 401 that awaits _initPromise which is waiting for checkAuthStatus.
      refreshToken: async () => {
        if (_initPromise) {
          const { token: existing } = get();
          if (existing) return existing;
          await _initPromise;
          const { token } = get();
          if (token) return token;
          throw new Error("Session expired");
        }
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
        queryClient.clear();
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
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Token is never persisted — ensure it starts null after rehydration
          state.token = null;
          state.isAuthenticated = false;
        }
      },
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
