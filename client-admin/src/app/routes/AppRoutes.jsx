import { Routes, Route } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { DashboardPage } from '../layouts/DashboardPage.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
import { ProtectedRoutes } from './ProtectedRoutes.jsx';
import { UnauthorizedPage } from '../../features/auth/pages/UnauthorizedPage.jsx';
import { RoleGuard } from './RoleGuard.jsx';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path='/' element={<AuthPage />} />
      <Route path='/reset-password' element={<AuthPage />} />
      <Route path='/unauthorized' element={<UnauthorizedPage />} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route
        path='/dashboard/*'
        element={
          <ProtectedRoutes>
            <RoleGuard allowedRoles={['ADMIN_ROLE']}>
              <DashboardPage />
            </RoleGuard>
          </ProtectedRoutes>
        }
      >
      </Route>
    </Routes>
  );
};
