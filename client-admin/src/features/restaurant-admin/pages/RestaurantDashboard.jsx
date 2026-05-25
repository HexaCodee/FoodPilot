import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useRestaurantStore } from '../store/restaurantStore.js';
import { getRestaurants } from '../../../shared/apis/restaurants.js';
import { getTables } from '../../../shared/apis/tables.js';
import { getMenus } from '../../../shared/apis/menus.js';
import { getOrders } from '../../../shared/apis/orders.js';
import { getReservations } from '../../../shared/apis/reservations.js';
import {
  TableIcon,
  UtensilsIcon,
  BagIcon,
  CalendarIcon,
  BarChartIcon,
  BuildingIcon,
  CheckIcon,
} from '../../../shared/components/ui/Icons.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const STATUS_LABEL = { PENDIENTE: 'Pendiente', ENVIADO: 'En camino', ENTREGADO: 'Entregado' };
const STATUS_COLOR = {
  PENDIENTE: 'text-fp-gold   bg-fp-gold-dim',
  ENVIADO: 'text-blue-400  bg-blue-400/10',
  ENTREGADO: 'text-fp-success bg-fp-success-dim',
};

const StatCard = ({ Icon, label, value, loading }) => (
  <div className='bg-fp-surface border border-fp-border rounded-xl p-5 hover:border-fp-gold/25 transition-colors'>
    <div className='p-2.5 rounded-lg bg-fp-gold-dim w-fit mb-4'>
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

const OrderRow = ({ order }) => (
  <div className='flex items-center justify-between py-3 border-b border-fp-border-subtle last:border-0'>
    <div>
      <p className='text-fp-text text-sm'>{order.product}</p>
      <p className='text-fp-subtle text-xs'>
        {order.customerName} · {order.quantity} unidad{order.quantity !== 1 ? 'es' : ''}
      </p>
    </div>
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[order.status] ?? STATUS_COLOR.PENDIENTE}`}
    >
      {STATUS_LABEL[order.status] ?? order.status}
    </span>
  </div>
);

// ── Restaurant picker (shown when no restaurant selected) ─────────────────────
const RestaurantPicker = ({ onSelect }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRestaurants({ isActive: 'all', limit: 100 })
      .then((r) => setRestaurants(r.data?.data ?? []))
      .catch(() => setRestaurants([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className='space-y-6 animate-fadeUp'>
      <div>
        <h1 className='font-display text-2xl text-fp-text'>Mi Restaurante</h1>
        <p className='text-fp-muted text-sm mt-0.5'>Selecciona tu restaurante para continuar</p>
      </div>

      <div className='bg-fp-surface border border-fp-border rounded-xl p-6 max-w-2xl'>
        <div className='flex items-center gap-3 mb-5'>
          <div className='p-2.5 rounded-lg bg-fp-gold-dim'>
            <BuildingIcon className='w-5 h-5 text-fp-gold' />
          </div>
          <div>
            <h2 className='text-fp-text font-medium'>¿Cuál es tu restaurante?</h2>
            <p className='text-fp-subtle text-xs mt-0.5'>Esta selección se guardará en tu sesión</p>
          </div>
        </div>

        {loading ? (
          <div className='space-y-2'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-14 w-full' />
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <p className='text-fp-muted text-sm text-center py-6'>
            No hay restaurantes registrados aún.
          </p>
        ) : (
          <div className='space-y-2'>
            {restaurants.map((r) => (
              <button
                key={r._id}
                onClick={() => onSelect(r)}
                className='w-full flex items-center justify-between px-4 py-3.5 rounded-lg border border-fp-border hover:border-fp-gold/40 hover:bg-fp-gold-dim transition-colors text-left group'
              >
                <div>
                  <p className='text-fp-text text-sm font-medium group-hover:text-fp-gold transition-colors'>
                    {r.name}
                  </p>
                  <p className='text-fp-subtle text-xs mt-0.5'>
                    {r.category} · {r.address}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${r.isActive ? 'bg-fp-success-dim text-fp-success' : 'bg-fp-elevated text-fp-muted'}`}
                >
                  {r.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main dashboard ────────────────────────────────────────────────────────────
export const RestaurantDashboard = () => {
  const { selectedRestaurant, setSelectedRestaurant, clearRestaurant } = useRestaurantStore();

  const [stats, setStats] = useState({
    tables: null,
    menus: null,
    orders: null,
    reservations: null,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!selectedRestaurant) return;
    setLoading(true);

    Promise.allSettled([
      getTables({ restaurant: selectedRestaurant._id, limit: 200, isAvailable: 'all' }),
      getMenus({ restaurant: selectedRestaurant._id, limit: 200 }),
      getOrders({ limit: 50 }),
      getReservations({ limit: 50 }),
    ])
      .then(([tables, menus, orders, reservations]) => {
        const tableList = tables.value?.data?.data ?? [];
        const menuList = menus.value?.data?.data ?? [];
        const orderData = orders.value?.data;
        const resData = reservations.value?.data;
        const orderList = Array.isArray(orderData) ? orderData : (orderData?.orders ?? []);
        const resList = Array.isArray(resData) ? resData : (resData?.reservations ?? []);

        setStats({
          tables: tableList.filter((t) => t.isAvailable).length,
          menus: menuList.filter((m) => m.isAvailable).length,
          orders: orderList.filter((o) => o.status === 'PENDIENTE').length,
          reservations: resList.filter((r) => r.status === 'ACTIVA').length,
        });
        setRecentOrders(orderList.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, [selectedRestaurant]);

  if (!selectedRestaurant) {
    return <RestaurantPicker onSelect={setSelectedRestaurant} />;
  }

  return (
    <div className='space-y-6 animate-fadeUp'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='font-display text-2xl text-fp-text'>{selectedRestaurant.name}</h1>
          <p className='text-fp-muted text-sm mt-0.5'>
            {selectedRestaurant.category} · {selectedRestaurant.address}
          </p>
        </div>
        <button
          onClick={clearRestaurant}
          className='text-xs text-fp-subtle hover:text-fp-gold transition-colors border border-fp-border hover:border-fp-gold/30 px-3 py-1.5 rounded-lg'
        >
          Cambiar restaurante
        </button>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
        <StatCard
          Icon={TableIcon}
          label='Mesas disponibles'
          value={stats.tables}
          loading={loading}
        />
        <StatCard Icon={UtensilsIcon} label='Ítems en menú' value={stats.menus} loading={loading} />
        <StatCard
          Icon={BagIcon}
          label='Pedidos pendientes'
          value={stats.orders}
          loading={loading}
        />
        <StatCard
          Icon={CalendarIcon}
          label='Reservas activas'
          value={stats.reservations}
          loading={loading}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-5'>
        {/* Recent orders */}
        <div className='bg-fp-surface border border-fp-border rounded-xl p-5'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-fp-text font-medium text-sm'>Pedidos recientes</h3>
            <BagIcon className='w-4 h-4 text-fp-subtle' />
          </div>
          {loading ? (
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className='h-12 w-full' />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <p className='text-fp-subtle text-sm text-center py-6'>Sin pedidos aún</p>
          ) : (
            recentOrders.map((o) => <OrderRow key={o._id} order={o} />)
          )}
        </div>

        {/* Quick links */}
        <div className='bg-fp-surface border border-fp-border rounded-xl p-5'>
          <h3 className='text-fp-text font-medium text-sm mb-4'>Gestión rápida</h3>
          <div className='grid grid-cols-2 gap-3'>
            {[
              { Icon: TableIcon, label: 'Gestionar mesas', path: '/dashboard/restaurant/tables' },
              { Icon: UtensilsIcon, label: 'Editar menú', path: '/dashboard/restaurant/menu' },
              { Icon: BagIcon, label: 'Ver pedidos', path: '/dashboard/restaurant/orders' },
              {
                Icon: CalendarIcon,
                label: 'Reservaciones',
                path: '/dashboard/restaurant/reservations',
              },
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
      </div>
    </div>
  );
};
