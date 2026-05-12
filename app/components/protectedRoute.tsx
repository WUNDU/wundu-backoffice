// ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { useLocation } from '@remix-run/react';
import { useAuthStore } from '~/store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) return; // Wait for silent refresh to complete
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, isLoading, location.pathname]);

  // While auth is initializing, show nothing (root.tsx handles the refresh)
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-[#003cc3] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
