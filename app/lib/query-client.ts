import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // axios interceptor already retries on 401 (with silent refresh) — letting
      // React Query also retry causes a second refresh cycle after logout, producing
      // duplicate network requests and a double-logout race
      retry: false,
      refetchOnWindowFocus: false,
      gcTime: 10 * 60 * 1000,
    },
  },
});
