import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore';
import {
  DashboardIcon,
  UsersIcon,
  BuildingIcon,
  CalendarIcon,
  BarChartIcon,
  UtensilsIcon,
  TableIcon,
  BagIcon,
  UserIcon,
  CloseIcon,
  ClipboardIcon,
  StarIcon,
  CreditCardIcon,
} from '../ui/Icons.jsx';

const NAV = {
  PLATFORM_ADMIN: [
    { label: 'Dashboard', path: '/dashboard/admin', Icon: DashboardIcon },
    { label: 'Usuarios', path: '/dashboard/admin/users', Icon: UsersIcon },
    { label: 'Restaurantes', path: '/dashboard/admin/restaurants', Icon: BuildingIcon },
    { label: 'Eventos', path: '/dashboard/admin/events', Icon: CalendarIcon },
    { label: 'Promociones', path: '/dashboard/admin/promotions', Icon: CreditCardIcon },
    { label: 'Reportes', path: '/dashboard/admin/reports', Icon: BarChartIcon },
    { label: 'Mi Perfil', path: '/dashboard/admin/profile', Icon: UserIcon },
  ],
  RESTAURANT_ADMIN: [
    { label: 'Dashboard', path: '/dashboard/restaurant', Icon: DashboardIcon },
    { label: 'Mesas', path: '/dashboard/restaurant/tables', Icon: TableIcon },
    { label: 'Menú', path: '/dashboard/restaurant/menu', Icon: UtensilsIcon },
    { label: 'Inventario', path: '/dashboard/restaurant/inventory', Icon: ClipboardIcon },
    { label: 'Pedidos', path: '/dashboard/restaurant/orders', Icon: BagIcon },
    { label: 'Reservaciones', path: '/dashboard/restaurant/reservations', Icon: CalendarIcon },
    { label: 'Promociones', path: '/dashboard/restaurant/promotions', Icon: CreditCardIcon },
    { label: 'Reportes', path: '/dashboard/restaurant/reports', Icon: BarChartIcon },
    { label: 'Mi Perfil', path: '/dashboard/restaurant/profile', Icon: UserIcon },
  ],
  CLIENT: [
    { label: 'Explorar', path: '/dashboard/client', Icon: BuildingIcon },
    { label: 'Menú', path: '/dashboard/client/menu', Icon: UtensilsIcon },
    { label: 'Eventos', path: '/dashboard/client/events', Icon: CalendarIcon },
    { label: 'Promociones', path: '/dashboard/client/promotions', Icon: CreditCardIcon },
    { label: 'Mis Reservaciones', path: '/dashboard/client/reservations', Icon: CalendarIcon },
    { label: 'Mis Pedidos', path: '/dashboard/client/orders', Icon: ClipboardIcon },
    { label: 'Calificaciones', path: '/dashboard/client/ratings', Icon: StarIcon },
    { label: 'Mi Perfil', path: '/dashboard/client/profile', Icon: UserIcon },
  ],
};
const ROLE_LABEL = {
  PLATFORM_ADMIN: 'Administrador',
  RESTAURANT_ADMIN: 'Admin. Restaurante',
  CLIENT: 'Cliente',
};

export const Sidebar = ({ isOpen, onClose }) => {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? 'CLIENT';
  const items = NAV[role] ?? NAV.CLIENT;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className='fixed inset-0 bg-black/60 z-30 lg:hidden' onClick={onClose} />}

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
        <div className='flex items-center justify-between px-5 py-5 border-b border-fp-border'>
          <div>
            <h1 className='font-display text-xl text-fp-gold tracking-wide'>FoodPilot</h1>
            <p className='text-fp-subtle text-xs tracking-widest uppercase mt-0.5'>Volamos tu antojo</p>
          </div>
          <button onClick={onClose} className='lg:hidden text-fp-muted hover:text-fp-text p-1'>
            <CloseIcon className='w-5 h-5' />
          </button>
        </div>

        {/* Role badge */}
        <div className='px-5 py-3 border-b border-fp-border-subtle'>
          <span className='text-xs font-medium text-fp-gold bg-fp-gold-dim px-2.5 py-1 rounded-full tracking-wide'>
            {ROLE_LABEL[role]}
          </span>
        </div>

        {/* Nav items */}
        <nav className='flex-1 px-3 py-4 space-y-0.5 overflow-y-auto'>
          {items.map(({ label, path, Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path.split('/').length <= 3}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${
                  isActive
                    ? 'bg-fp-gold-dim text-fp-gold border border-fp-gold/20'
                    : 'text-fp-muted hover:text-fp-gold hover:bg-fp-gold-dim/10'
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

        {/* Bottom padding */}
        <div className='h-4' />
      </aside>
    </>
  );
};
