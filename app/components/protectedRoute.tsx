// ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { useLocation } from '@remix-run/react';
import { useAuthStore } from '~/store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, location.pathname]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
