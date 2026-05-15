import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { MenuIcon, BellIcon, UserIcon } from '../ui/Icons.jsx';

const PAGE_TITLES = {
  // Admin
  '/dashboard/admin':              'Panel General',
  '/dashboard/admin/users':        'Gestión de Usuarios',
  '/dashboard/admin/restaurants':  'Restaurantes',
  '/dashboard/admin/events':       'Eventos',
  '/dashboard/admin/reports':      'Reportes',
  // Restaurant
  '/dashboard/restaurant':               'Mi Restaurante',
  '/dashboard/restaurant/tables':        'Mesas',
  '/dashboard/restaurant/menu':          'Menú',
  '/dashboard/restaurant/orders':        'Pedidos',
  '/dashboard/restaurant/reservaciones': 'Reservaciones',
  '/dashboard/restaurant/reservations':  'Reservaciones',
  '/dashboard/restaurant/reports':       'Reportes',
  // Client
  '/dashboard/client':               'Explorar Restaurantes',
  '/dashboard/client/reservations':  'Mis Reservaciones',
  '/dashboard/client/orders':        'Mis Pedidos',
  '/dashboard/client/profile':       'Mi Perfil',
};

export const Navbar = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const user = useAuthStore((s) => s.user);
  const title = PAGE_TITLES[pathname] ?? 'FoodPilot';

  return (
    <header className="h-14 bg-fp-sidebar border-b border-fp-border flex items-center justify-between px-4 flex-shrink-0">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-fp-muted hover:text-fp-text p-1.5 rounded-lg hover:bg-fp-elevated transition-colors"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        <h2 className="text-fp-text font-medium text-sm">{title}</h2>
      </div>

      {/* Right: bell + user */}
      <div className="flex items-center gap-1">
        <button className="p-2 rounded-lg text-fp-muted hover:text-fp-text hover:bg-fp-elevated transition-colors relative">
          <BellIcon className="w-4.5 h-4.5" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-fp-gold rounded-full" />
        </button>

        <div className="flex items-center gap-2 ml-2 pl-3 border-l border-fp-border">
          <div className="w-7 h-7 rounded-full bg-fp-gold-dim border border-fp-gold/30 flex items-center justify-center">
            <UserIcon className="w-3.5 h-3.5 text-fp-gold" />
          </div>
          <span className="text-fp-text text-sm font-medium hidden sm:block max-w-28 truncate">
            {user?.username ?? 'Usuario'}
          </span>
        </div>
      </div>
    </header>
  );
};
