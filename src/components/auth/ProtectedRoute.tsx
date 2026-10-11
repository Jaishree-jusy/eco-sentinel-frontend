import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/AuthContext';
import type { UserRole } from '@/auth/AuthContext';

interface ProtectedRouteProps {
  allowedRole: UserRole;
}

export function ProtectedRoute({
  allowedRole,
}: ProtectedRouteProps) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (user.role !== allowedRole) {
    return (
      <Navigate
        to={
          user.role === 'government'
            ? '/government/dashboard'
            : '/ngo/dashboard'
        }
        replace
      />
    );
  }

  return <Outlet />;
}