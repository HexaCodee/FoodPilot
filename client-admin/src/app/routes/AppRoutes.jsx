import { Routes, Route, Navigate } from 'react-router-dom';

import { AuthPage }          from '../../features/auth/pages/AuthPage.jsx';
import { UnauthorizedPage }  from '../../features/auth/pages/UnauthorizedPage.jsx';
import { VerifyEmailPage }   from '../../features/auth/pages/VerifyEmailPage.jsx';
import { DashboardPage }     from '../layouts/DashboardPage.jsx';
import { ProtectedRoutes }   from './ProtectedRoutes.jsx';
import { RoleGuard }         from './RoleGuard.jsx';

// Platform Admin pages
import { AdminDashboard }       from '../../features/platform-admin/pages/AdminDashboard.jsx';
import { UsersPage }            from '../../features/platform-admin/pages/UsersPage.jsx';
import { AdminRestaurantsPage } from '../../features/platform-admin/pages/AdminRestaurantsPage.jsx';
import { AdminEventsPage }      from '../../features/platform-admin/pages/AdminEventsPage.jsx';
import { AdminReportsPage }     from '../../features/platform-admin/pages/AdminReportsPage.jsx';
import { AdminPromotionsPage }  from '../../features/platform-admin/pages/AdminPromotionsPage.jsx';

// Restaurant Admin pages
import { RestaurantDashboard }        from '../../features/restaurant-admin/pages/RestaurantDashboard.jsx';
import { TablesPage }                 from '../../features/restaurant-admin/pages/TablesPage.jsx';
import { MenuPage }                   from '../../features/restaurant-admin/pages/MenuPage.jsx';
import { InventoryPage }              from '../../features/restaurant-admin/pages/InventoryPage.jsx';
import { OrdersPage }                 from '../../features/restaurant-admin/pages/OrdersPage.jsx';
import { ReservationsPage }           from '../../features/restaurant-admin/pages/ReservationsPage.jsx';
import { RestaurantReportsPage }      from '../../features/restaurant-admin/pages/RestaurantReportsPage.jsx';
import { RestaurantPromotionsPage }   from '../../features/restaurant-admin/pages/RestaurantPromotionsPage.jsx';

// Client pages
import { ClientDashboard }      from '../../features/client/pages/ClientDashboard.jsx';
import { ClientMenuPage }       from '../../features/client/pages/ClientMenuPage.jsx';
import { ClientEventsPage }     from '../../features/client/pages/ClientEventsPage.jsx';
import { MyReservationsPage }   from '../../features/client/pages/MyReservationsPage.jsx';
import { MyOrdersPage }         from '../../features/client/pages/MyOrdersPage.jsx';
import { ProfilePage }          from '../../features/client/pages/ProfilePage.jsx';
import { ClientRatingsPage }    from '../../features/client/pages/ClientRatingsPage.jsx';
import { ClientPromotionsPage } from '../../features/client/pages/ClientPromotionsPage.jsx';

const Guard = ({ role, children }) => (
  <ProtectedRoutes>
    <RoleGuard allowedRoles={[role]}>
      {children}
    </RoleGuard>
  </ProtectedRoutes>
);

export const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path='/'               element={<AuthPage />} />
    <Route path='/reset-password' element={<AuthPage />} />
    <Route path='/verify-email'   element={<VerifyEmailPage />} />
    <Route path='/unauthorized'   element={<UnauthorizedPage />} />

    {/* Platform Admin */}
    <Route path='/dashboard/admin' element={<Guard role='PLATFORM_ADMIN'><DashboardPage /></Guard>}>
      <Route index              element={<AdminDashboard />} />
      <Route path='users'       element={<UsersPage />} />
      <Route path='restaurants' element={<AdminRestaurantsPage />} />
      <Route path='events'      element={<AdminEventsPage />} />
      <Route path='promotions'  element={<AdminPromotionsPage />} />
      <Route path='reports'     element={<AdminReportsPage />} />
      <Route path='profile'     element={<ProfilePage />} />
    </Route>

    {/* Restaurant Admin */}
    <Route path='/dashboard/restaurant' element={<Guard role='RESTAURANT_ADMIN'><DashboardPage /></Guard>}>
      <Route index                element={<RestaurantDashboard />} />
      <Route path='tables'        element={<TablesPage />} />
      <Route path='menu'          element={<MenuPage />} />
      <Route path='inventory'     element={<InventoryPage />} />
      <Route path='orders'        element={<OrdersPage />} />
      <Route path='reservations'  element={<ReservationsPage />} />
      <Route path='promotions'    element={<RestaurantPromotionsPage />} />
      <Route path='reports'       element={<RestaurantReportsPage />} />
      <Route path='profile'       element={<ProfilePage />} />
    </Route>

    {/* Client */}
    <Route path='/dashboard/client' element={<Guard role='CLIENT'><DashboardPage /></Guard>}>
      <Route index                element={<ClientDashboard />} />
      <Route path='menu'          element={<ClientMenuPage />} />
      <Route path='events'        element={<ClientEventsPage />} />
      <Route path='promotions'    element={<ClientPromotionsPage />} />
      <Route path='reservations'  element={<MyReservationsPage />} />
      <Route path='orders'        element={<MyOrdersPage />} />
      <Route path='ratings'       element={<ClientRatingsPage />} />
      <Route path='profile'       element={<ProfilePage />} />
    </Route>

    {/* Catch-all */}
    <Route path='*' element={<Navigate to='/' replace />} />
  </Routes>
);
