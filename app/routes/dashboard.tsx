import { Outlet } from "@remix-run/react";
import { ProtectedRoute } from "~/components/protectedRoute";

/**
 * Layout route for all /dashboard/* paths.
 * ProtectedRoute blocks rendering until auth resolves and redirects
 * unauthenticated users to /login — consistent with wundu-web pattern.
 */
export default function DashboardLayout() {
  return (
    <ProtectedRoute>
      <Outlet />
    </ProtectedRoute>
  );
}
