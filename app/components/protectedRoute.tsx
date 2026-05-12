// ProtectedRoute.tsx
import React, { useEffect, useState } from 'react';
import { useLocation } from '@remix-run/react';
import { useAuthStore } from '~/store/auth-store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const location = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
    setChecked(true);
  }, [isAuthenticated, isLoading, location.pathname]);

  // Block all children until auth resolves — prevents API calls before init completes
  if (isLoading || !checked) return null;

  if (!isAuthenticated) return null;

  return <>{children}</>;
};
