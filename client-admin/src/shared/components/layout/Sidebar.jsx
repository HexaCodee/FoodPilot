import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore';
import {
  DashboardIcon, UsersIcon, BuildingIcon, CalendarIcon, BarChartIcon,
  UtensilsIcon, TableIcon, BagIcon, UserIcon, LogOutIcon, CloseIcon, ClipboardIcon,
} from '../ui/Icons.jsx';

const NAV = {
  PLATFORM_ADMIN: [
    { label: 'Dashboard',    path: '/dashboard/admin',              Icon: DashboardIcon },
    { label: 'Usuarios',     path: '/dashboard/admin/users',        Icon: UsersIcon },
    { label: 'Restaurantes', path: '/dashboard/admin/restaurants',  Icon: BuildingIcon },
    { label: 'Eventos',      path: '/dashboard/admin/events',       Icon: CalendarIcon },
    { label: 'Reportes',     path: '/dashboard/admin/reports',      Icon: BarChartIcon },
  ],
  RESTAURANT_ADMIN: [
    { label: 'Dashboard',      path: '/dashboard/restaurant',                Icon: DashboardIcon },
    { label: 'Mesas',          path: '/dashboard/restaurant/tables',         Icon: TableIcon },
    { label: 'Menú',           path: '/dashboard/restaurant/menu',           Icon: UtensilsIcon },
    { label: 'Pedidos',        path: '/dashboard/restaurant/orders',         Icon: BagIcon },
    { label: 'Reservaciones',  path: '/dashboard/restaurant/reservations',   Icon: CalendarIcon },
    { label: 'Reportes',       path: '/dashboard/restaurant/reports',        Icon: BarChartIcon },
  ],
  CLIENT: [
    { label: 'Explorar',          path: '/dashboard/client',               Icon: BuildingIcon },
    { label: 'Mis Reservaciones', path: '/dashboard/client/reservations',  Icon: CalendarIcon },
    { label: 'Mis Pedidos',       path: '/dashboard/client/orders',        Icon: ClipboardIcon },
    { label: 'Mi Perfil',         path: '/dashboard/client/profile',       Icon: UserIcon },
  ],
};

const ROLE_LABEL = {
  PLATFORM_ADMIN: 'Administrador',
  RESTAURANT_ADMIN: 'Admin. Restaurante',
  CLIENT: 'Cliente',
};

export const Sidebar = ({ isOpen, onClose }) => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const role = user?.role ?? 'CLIENT';
  const items = NAV[role] ?? NAV.CLIENT;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-fp-sidebar border-r border-fp-border z-40
          flex flex-col transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-fp-border">
          <div>
            <h1 className="font-display text-xl text-fp-gold tracking-wide">FoodPilot</h1>
            <p className="text-fp-subtle text-xs tracking-widest uppercase mt-0.5">Management</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-fp-muted hover:text-fp-text p-1">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-5 py-3 border-b border-fp-border-subtle">
          <span className="text-xs font-medium text-fp-gold bg-fp-gold-dim px-2.5 py-1 rounded-full tracking-wide">
            {ROLE_LABEL[role]}
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {items.map(({ label, path, Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path.split('/').length <= 3}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-fp-gold-dim text-fp-gold border border-fp-gold/20'
                  : 'text-fp-muted hover:text-fp-text hover:bg-fp-elevated'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-fp-gold' : ''}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Divider */}
        <div className="gold-divider mx-4" />

        {/* User + logout */}
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-fp-gold-dim border border-fp-gold/30 flex items-center justify-center flex-shrink-0">
              <UserIcon className="w-4 h-4 text-fp-gold" />
            </div>
            <div className="min-w-0">
              <p className="text-fp-text text-sm font-medium truncate">{user?.username ?? 'Usuario'}</p>
              <p className="text-fp-subtle text-xs truncate">{ROLE_LABEL[role]}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-fp-muted hover:text-fp-danger hover:bg-fp-danger-dim transition-colors duration-150"
          >
            <LogOutIcon className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
};
