import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../auth/store/authStore.js';
import { getRestaurants } from '../../../shared/apis/restaurants.js';
import { getOrders } from '../../../shared/apis/orders.js';
import { getReservations } from '../../../shared/apis/reservations.js';
import {
  BuildingIcon,
  CalendarIcon,
  BagIcon,
  StarIcon,
  MapPinIcon,
  SearchIcon,
} from '../../../shared/components/ui/Icons.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const StatCard = ({ Icon, label, value, loading, to }) => {
  const content = (
    <div className='bg-fp-surface border border-fp-border rounded-xl p-5 hover:border-fp-gold/25 transition-colors h-full'>
      <div className='p-2.5 rounded-lg bg-fp-gold-dim w-fit mb-3'>
        <Icon className='w-5 h-5 text-fp-gold' />
      </div>
      <p className='text-fp-muted text-xs uppercase tracking-wide mb-1'>{label}</p>
      {loading ? (
        <Skeleton className='h-8 w-16 mt-1' />
      ) : (
        <p className='text-fp-text text-2xl font-semibold'>{value ?? '—'}</p>
      )}
    </div>
  );
  return to ? (
    <Link to={to} className='block'>
      {content}
    </Link>
  ) : (
    content
  );
};

const RestaurantCard = ({ restaurant }) => (
  <div className='bg-fp-surface border border-fp-border rounded-xl p-4 hover:border-fp-gold/30 transition-colors group'>
    <div className='flex items-start justify-between mb-2'>
      <div className='flex-1 min-w-0'>
        <h4 className='text-fp-text text-sm font-medium group-hover:text-fp-gold transition-colors truncate'>
          {restaurant.name}
        </h4>
        <span className='text-fp-subtle text-xs'>{restaurant.category}</span>
      </div>
      {restaurant.rating > 0 && (
        <span className='flex-shrink-0 ml-2 flex items-center gap-1'>
          <StarIcon className='w-3.5 h-3.5 text-fp-gold' />
          <span className='text-fp-gold text-xs font-medium'>
            {Number(restaurant.rating).toFixed(1)}
          </span>
        </span>
      )}
    </div>
    {restaurant.address && (
      <div className='flex items-center gap-1 mt-2'>
        <MapPinIcon className='w-3 h-3 text-fp-subtle flex-shrink-0' />
        <span className='text-fp-subtle text-xs truncate'>{restaurant.address}</span>
      </div>
    )}
  </div>
);

// ── Main dashboard ────────────────────────────────────────────────────────────
export const ClientDashboard = () => {
  const user = useAuthStore((s) => s.user);

  const [restaurants, setRestaurants] = useState([]);
  const [stats, setStats] = useState({ orders: null, reservations: null, restaurants: null });
  const [loading, setLoading] = useState(true);
  const [resLoading, setResLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Load stats
    Promise.allSettled([
      getOrders({ userId: user?.id }),
      getReservations({ userId: user?.id }),
      getRestaurants({ isActive: true, limit: 1 }),
    ])
      .then(([orders, reservations, restaurants]) => {
        const orderList = Array.isArray(orders.value?.data) ? orders.value.data : [];
        const resList = Array.isArray(reservations.value?.data) ? reservations.value.data : [];
        setStats({
          orders: orderList.length,
          reservations: resList.filter((r) => r.status === 'ACTIVA').length,
          restaurants: restaurants.value?.data?.pagination?.totalRecords ?? null,
        });
      })
      .finally(() => setLoading(false));

    // Load restaurant grid
    getRestaurants({ isActive: true, limit: 9 })
      .then((r) => setRestaurants(r.data?.data ?? []))
      .catch(() => setRestaurants([]))
      .finally(() => setResLoading(false));
  }, [user?.id]);

  return (
    <div className='space-y-6 animate-fadeUp'>
      {/* Greeting */}
      <div>
        <h1 className='font-display text-2xl text-fp-text'>
          Hola, {user?.username ?? 'usuario'} 👋
        </h1>
        <p className='text-fp-muted text-sm mt-0.5'>Explora restaurantes y gestiona tus pedidos</p>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <StatCard
          Icon={BagIcon}
          label='Pedidos totales'
          value={stats.orders}
          loading={loading}
          to='/dashboard/client/orders'
        />
        <StatCard
          Icon={CalendarIcon}
          label='Reservas activas'
          value={stats.reservations}
          loading={loading}
          to='/dashboard/client/reservations'
        />
        <StatCard
          Icon={BuildingIcon}
          label='Restaurantes'
          value={stats.restaurants}
          loading={loading}
        />
      </div>

      {/* Restaurant grid */}
      <div className='bg-fp-surface border border-fp-border rounded-xl p-5'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-fp-text font-medium text-sm'>Restaurantes disponibles</h3>
          <BuildingIcon className='w-4 h-4 text-fp-subtle' />
        </div>

        {/* Search */}
        <div className='relative mb-4'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fp-subtle' />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Buscar restaurante…'
            className='w-full pl-9 pr-3 py-2 bg-fp-bg border border-fp-border rounded-lg text-fp-text text-sm placeholder-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors'
          />
        </div>

        {resLoading ? (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-20 w-full' />
            ))}
          </div>
        ) : restaurants.filter(
            (r) => !search || r.name.toLowerCase().includes(search.toLowerCase())
          ).length === 0 ? (
          <p className='text-fp-subtle text-sm text-center py-8'>
            {search ? 'Sin resultados para esa búsqueda' : 'Sin restaurantes disponibles'}
          </p>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
            {restaurants
              .filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()))
              .map((r) => (
                <RestaurantCard key={r._id} restaurant={r} />
              ))}
          </div>
        )}
      </div>

      {/* Quick access */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {[
          { Icon: BagIcon, label: 'Mis pedidos', path: '/dashboard/client/orders' },
          {
            Icon: CalendarIcon,
            label: 'Mis reservaciones',
            path: '/dashboard/client/reservations',
          },
          { Icon: BuildingIcon, label: 'Menú', path: '/dashboard/client/menu' },
          { Icon: CalendarIcon, label: 'Eventos', path: '/dashboard/client/events' },
        ].map(({ Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className='flex items-center gap-2.5 p-3 rounded-lg border border-fp-border hover:border-fp-gold/30 hover:bg-fp-gold-dim transition-colors group'
          >
            <Icon className='w-4 h-4 text-fp-muted group-hover:text-fp-gold transition-colors' />
            <span className='text-fp-muted group-hover:text-fp-text text-xs transition-colors'>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};
