import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import React, { useEffect } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./tailwind.css";
import { Toaster } from "sonner";
import { useAuthStore } from "~/store/auth-store";
import { queryClient } from "~/lib/query-client";

export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Toaster position="top-right" richColors />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, initializeAuth } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const currentPath = location.pathname;

    if (isAuthenticated) {
      if (currentPath === "/" || currentPath === "/login") {
        navigate("/dashboard", { replace: true });
      }
    } else {
      if (currentPath.startsWith("/dashboard")) {
        navigate("/login", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  // One-time cleanup of old Zustand localStorage caches (post-RQ migration)
  useEffect(() => {
    [
      "wundu-admin-dashboard-cache",
      "wundu-admin-users-cache",
      "wundu-admin-transactions-cache",
      "wundu-admin-goals-cache",
      "wundu-admin-categories-cache",
    ].forEach((k) => localStorage.removeItem(k));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
