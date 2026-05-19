import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers }        from '../../../shared/apis/users.js';
import { getRestaurants }  from '../../../shared/apis/restaurants.js';
import { getEvents, getSalesReports } from '../../../shared/apis/events.js';
import {
  UsersIcon, BuildingIcon, CalendarIcon,
  TrendUpIcon, BarChartIcon,
} from '../../../shared/components/ui/Icons.jsx';

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ Icon, label, value, sub, loading }) => (
  <div className="bg-fp-surface border border-fp-border rounded-xl p-5 hover:border-fp-gold/25 transition-colors group">
    <div className="flex items-start justify-between mb-4">
      <div className="p-2.5 rounded-lg bg-fp-gold-dim">
        <Icon className="w-5 h-5 text-fp-gold" />
      </div>
    </div>
    <p className="text-fp-muted text-xs uppercase tracking-wide mb-1">{label}</p>
    {loading
      ? <Skeleton className="h-8 w-20 mt-1" />
      : <p className="text-fp-text text-2xl font-semibold">{value ?? '—'}</p>
    }
    {sub && <p className="text-fp-subtle text-xs mt-1">{sub}</p>}
  </div>
);

// ── Quick-link card ───────────────────────────────────────────────────────────
const QuickLink = ({ Icon, label, path }) => (
  <Link to={path}
    className="flex items-center gap-2.5 p-3 rounded-lg border border-fp-border hover:border-fp-gold/30 hover:bg-fp-gold-dim transition-colors group">
    <Icon className="w-4 h-4 text-fp-muted group-hover:text-fp-gold transition-colors" />
    <span className="text-fp-muted group-hover:text-fp-text text-xs transition-colors">{label}</span>
  </Link>
);

// ── Main dashboard ────────────────────────────────────────────────────────────
export const AdminDashboard = () => {
  const [stats, setStats]   = useState({ users: null, restaurants: null, events: null, sales: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fmtMoney = (n) =>
      n == null ? '—' : `$${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`;

    Promise.allSettled([
      getUsers({ limit: 1 }),
      getRestaurants({ isActive: 'all', limit: 1 }),
      getEvents(),
      getSalesReports(),
    ]).then(([users, restaurants, events, sales]) => {
      const totalUsers       = users.value?.data?.total ?? null;
      const totalRestaurants = restaurants.value?.data?.pagination?.totalRecords ?? null;
      const eventList        = Array.isArray(events.value?.data) ? events.value.data : [];
      const activeEvents     = eventList.filter((e) => e.status === 'ACTIVO').length;
      const reportList       = Array.isArray(sales.value?.data) ? sales.value.data : [];
      const totalSales       = reportList.reduce((s, r) => s + (r.totalSales ?? 0), 0);

      setStats({
        users:       totalUsers,
        restaurants: totalRestaurants,
        events:      activeEvents,
        sales:       fmtMoney(totalSales > 0 ? totalSales : null),
      });
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display text-2xl text-fp-text">Panel General</h1>
        <p className="text-fp-muted text-sm mt-0.5">Resumen de la plataforma FoodPilot</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          Icon={UsersIcon}
          label="Usuarios registrados"
          value={stats.users}
          sub="Total en la plataforma"
          loading={loading}
        />
        <StatCard
          Icon={BuildingIcon}
          label="Restaurantes"
          value={stats.restaurants}
          sub="Total registrados"
          loading={loading}
        />
        <StatCard
          Icon={CalendarIcon}
          label="Eventos activos"
          value={stats.events}
          sub="Con estado ACTIVO"
          loading={loading}
        />
        <StatCard
          Icon={TrendUpIcon}
          label="Ventas reportadas"
          value={stats.sales}
          sub="Suma de reportes de ventas"
          loading={loading}
        />
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Info panel */}
        <div className="bg-fp-surface border border-fp-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-fp-text font-medium text-sm">Estado de la plataforma</h3>
            <BarChartIcon className="w-4 h-4 text-fp-subtle" />
          </div>
          <div className="space-y-3">
            {[
              { label: 'Auth service',       status: 'Activo', color: 'bg-fp-success' },
              { label: 'Restaurant service', status: 'Activo', color: 'bg-fp-success' },
              { label: 'Order service',      status: 'Activo', color: 'bg-fp-success' },
              { label: 'Event service',      status: 'Activo', color: 'bg-fp-success' },
            ].map(({ label, status, color }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-fp-border-subtle last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-fp-text text-sm">{label}</span>
                </div>
                <span className="text-fp-success text-xs">{status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick access */}
        <div className="bg-fp-surface border border-fp-border rounded-xl p-5">
          <h3 className="text-fp-text font-medium text-sm mb-4">Acceso rápido</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickLink Icon={UsersIcon}    label="Ver usuarios"     path="/dashboard/admin/users" />
            <QuickLink Icon={BuildingIcon} label="Ver restaurantes" path="/dashboard/admin/restaurants" />
            <QuickLink Icon={CalendarIcon} label="Ver eventos"      path="/dashboard/admin/events" />
            <QuickLink Icon={BarChartIcon} label="Ver reportes"     path="/dashboard/admin/reports" />
          </div>
        </div>
      </div>
    </div>
  );
};
