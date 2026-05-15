import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/authStore';

export const RoleGuard = ({ children, allowedRoles = [] }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const getDashboardPath = useAuthStore((s) => s.getDashboardPath);

  if (!isAuthenticated) return <Navigate to='/' replace />;

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={getDashboardPath()} replace />;
  }

  return children;
};
