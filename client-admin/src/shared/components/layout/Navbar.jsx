import { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore';
import { MenuIcon, UserIcon, LogOutIcon } from '../ui/Icons.jsx';
import logoImg from '../../../assets/img/FoodPilot.png';

const PAGE_TITLES = {
  // Admin
  '/dashboard/admin': 'Panel General',
  '/dashboard/admin/users': 'Gestión de Usuarios',
  '/dashboard/admin/restaurants': 'Restaurantes',
  '/dashboard/admin/events': 'Eventos',
  '/dashboard/admin/promotions': 'Promociones',
  '/dashboard/admin/reports': 'Reportes',
  // Restaurant
  '/dashboard/restaurant': 'Mi Restaurante',
  '/dashboard/restaurant/tables': 'Mesas',
  '/dashboard/restaurant/menu': 'Menú',
  '/dashboard/restaurant/inventory': 'Inventario',
  '/dashboard/restaurant/orders': 'Pedidos',
  '/dashboard/restaurant/reservations': 'Reservaciones',
  '/dashboard/restaurant/promotions': 'Promociones',
  '/dashboard/restaurant/reports': 'Reportes',
  // Admin profile
  '/dashboard/admin/profile': 'Mi Perfil',
  // Restaurant profile
  '/dashboard/restaurant/profile': 'Mi Perfil',
  // Client
  '/dashboard/client': 'Explorar Restaurantes',
  '/dashboard/client/menu': 'Menú',
  '/dashboard/client/events': 'Eventos',
  '/dashboard/client/promotions': 'Promociones',
  '/dashboard/client/reservations': 'Mis Reservaciones',
  '/dashboard/client/orders': 'Mis Pedidos',
  '/dashboard/client/ratings': 'Calificaciones',
  '/dashboard/client/profile': 'Mi Perfil',
};

const ROLE_LABEL = {
  CLIENT: 'Cliente',
  RESTAURANT_ADMIN: 'Admin. Restaurante',
  PLATFORM_ADMIN: 'Administrador',
};

const ROLE_STYLE = {
  CLIENT: 'bg-blue-400/10 text-blue-400',
  RESTAURANT_ADMIN: 'bg-fp-gold-dim text-fp-gold',
  PLATFORM_ADMIN: 'bg-purple-400/10 text-purple-400',
};

const PROFILE_PATH = {
  CLIENT: '/dashboard/client/profile',
  RESTAURANT_ADMIN: '/dashboard/restaurant/profile',
  PLATFORM_ADMIN: '/dashboard/admin/profile',
};

export const Navbar = ({ onMenuClick }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const title = PAGE_TITLES[pathname] ?? 'FoodPilot';

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const role = user?.role ?? 'CLIENT';
  const profilePath = PROFILE_PATH[role];
  const initials = user?.username ? user.username.slice(0, 2).toUpperCase() : '?';

  const handleLogout = () => {
    setOpen(false);
    logout();
  };

  const handleProfile = () => {
    setOpen(false);
    navigate(profilePath);
  };

  return (
    <header className='h-14 bg-fp-sidebar border-b border-fp-border flex items-center justify-between px-4 flex-shrink-0 relative z-20'>
      {/* Left: hamburger + title */}
      <div className='flex items-center gap-3'>
        <button
          onClick={onMenuClick}
          className='lg:hidden text-fp-muted hover:text-fp-text p-1.5 rounded-lg hover:bg-fp-elevated transition-colors'
        >
          <MenuIcon className='w-5 h-5' />
        </button>

        <div className='flex items-center gap-3'>
          <div className='hidden sm:flex items-center gap-3'>
            <img src={logoImg} alt='FoodPilot logo' className='h-10 w-10 rounded-2xl bg-fp-sidebar border border-fp-border p-1 object-contain' />
            <div className='hidden md:flex flex-col'>
              <span className='text-fp-text text-sm font-semibold leading-none'>FoodPilot</span>
              <span className='text-fp-muted text-[11px] uppercase tracking-[0.2em]'>{title}</span>
            </div>
          </div>
          <h2 className='text-fp-text font-medium text-sm sm:hidden'>{title}</h2>
        </div>
      </div>

      {/* Right: user menu */}
      <div className='relative' ref={dropdownRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className='flex items-center gap-2 pl-3 border-l border-fp-border hover:bg-fp-elevated rounded-lg px-2 py-1.5 transition-colors group'
        >
          {/* Avatar */}
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.username}
              className='w-7 h-7 rounded-full object-cover border border-fp-gold/30 flex-shrink-0'
            />
          ) : (
            <div className='w-7 h-7 rounded-full bg-fp-gold-dim border border-fp-gold/30 flex items-center justify-center flex-shrink-0'>
              <span className='text-fp-gold text-xs font-bold leading-none'>{initials}</span>
            </div>
          )}
          <span className='text-fp-text text-sm font-medium hidden sm:block max-w-28 truncate'>
            {user?.username ?? 'Usuario'}
          </span>
          {/* Chevron */}
          <svg
            className={`w-3.5 h-3.5 text-fp-muted transition-transform duration-200 hidden sm:block ${open ? 'rotate-180' : ''}`}
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            strokeWidth={2.5}
          >
            <path strokeLinecap='round' strokeLinejoin='round' d='M19 9l-7 7-7-7' />
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div className='absolute right-0 top-full mt-2 w-64 bg-fp-surface border border-fp-border rounded-xl shadow-xl overflow-hidden animate-fadeIn'>
            {/* User info header */}
            <div className='px-4 py-4 border-b border-fp-border flex items-center gap-3'>
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.username}
                  className='w-10 h-10 rounded-full object-cover border-2 border-fp-gold/30 flex-shrink-0'
                />
              ) : (
                <div className='w-10 h-10 rounded-full bg-fp-gold-dim border-2 border-fp-gold/20 flex items-center justify-center flex-shrink-0'>
                  <span className='text-fp-gold text-sm font-bold'>{initials}</span>
                </div>
              )}
              <div className='min-w-0'>
                <p className='text-fp-text text-sm font-semibold truncate'>
                  {user?.username ?? '—'}
                </p>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 inline-block ${ROLE_STYLE[role] ?? ROLE_STYLE.CLIENT}`}
                >
                  {ROLE_LABEL[role] ?? role}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className='py-1.5'>
              {profilePath && (
                <button
                  onClick={handleProfile}
                  className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-fp-muted hover:text-fp-text hover:bg-fp-elevated transition-colors text-left'
                >
                  <UserIcon className='w-4 h-4 flex-shrink-0' />
                  Mi Perfil
                </button>
              )}
              <div className={profilePath ? 'border-t border-fp-border-subtle mt-1 pt-1' : ''}>
                <button
                  onClick={handleLogout}
                  className='w-full flex items-center gap-3 px-4 py-2.5 text-sm text-fp-muted hover:text-fp-danger hover:bg-fp-danger-dim transition-colors text-left'
                >
                  <LogOutIcon className='w-4 h-4 flex-shrink-0' />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
