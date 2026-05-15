import { UsersIcon, BuildingIcon, CalendarIcon, TrendUpIcon, BarChartIcon, BagIcon } from '../../../shared/components/ui/Icons.jsx';

const StatCard = ({ Icon, label, value, sub, accent }) => (
  <div className="bg-fp-surface border border-fp-border rounded-xl p-5 hover:border-fp-gold/25 transition-colors group">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-2.5 rounded-lg ${accent}`}>
        <Icon className="w-5 h-5 text-fp-gold" />
      </div>
    </div>
    <p className="text-fp-muted text-xs uppercase tracking-wide mb-1">{label}</p>
    <p className="text-fp-text text-2xl font-semibold">{value}</p>
    {sub && <p className="text-fp-subtle text-xs mt-1">{sub}</p>}
  </div>
);

const Activity = ({ text, time, type }) => {
  const colors = { success: 'bg-fp-success', warning: 'bg-fp-gold', info: 'bg-blue-500' };
  return (
    <div className="flex items-start gap-3 py-3 border-b border-fp-border-subtle last:border-0">
      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colors[type] ?? colors.info}`} />
      <div className="flex-1 min-w-0">
        <p className="text-fp-text text-sm">{text}</p>
        <p className="text-fp-subtle text-xs mt-0.5">{time}</p>
      </div>
    </div>
  );
};

export const AdminDashboard = () => (
  <div className="space-y-6 animate-fadeUp">
    <div>
      <h1 className="font-display text-2xl text-fp-text">Panel General</h1>
      <p className="text-fp-muted text-sm mt-0.5">Resumen de la plataforma FoodPilot</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard Icon={UsersIcon}    label="Usuarios Registrados" value="—"  sub="Pendiente de integración" accent="bg-fp-gold-dim" />
      <StatCard Icon={BuildingIcon} label="Restaurantes Activos"  value="—"  sub="Pendiente de integración" accent="bg-fp-gold-dim" />
      <StatCard Icon={BagIcon}      label="Pedidos del mes"       value="—"  sub="Pendiente de integración" accent="bg-fp-gold-dim" />
      <StatCard Icon={TrendUpIcon}  label="Ingresos estimados"    value="—"  sub="Pendiente de integración" accent="bg-fp-gold-dim" />
    </div>

    {/* Bottom grid */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Activity */}
      <div className="bg-fp-surface border border-fp-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-fp-text font-medium text-sm">Actividad reciente</h3>
          <BarChartIcon className="w-4 h-4 text-fp-subtle" />
        </div>
        <Activity text="Nuevo restaurante registrado" time="Hace 5 min" type="success" />
        <Activity text="Usuario verificó su correo" time="Hace 12 min" type="info" />
        <Activity text="Evento programado para el viernes" time="Hace 1 hora" type="warning" />
        <Activity text="Nuevo pedido completado" time="Hace 2 horas" type="success" />
      </div>

      {/* Quick access */}
      <div className="bg-fp-surface border border-fp-border rounded-xl p-5">
        <h3 className="text-fp-text font-medium text-sm mb-4">Acceso rápido</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { Icon: UsersIcon,    label: 'Ver usuarios',        path: '/dashboard/admin/users' },
            { Icon: BuildingIcon, label: 'Ver restaurantes',    path: '/dashboard/admin/restaurants' },
            { Icon: CalendarIcon, label: 'Ver eventos',         path: '/dashboard/admin/events' },
            { Icon: BarChartIcon, label: 'Ver reportes',        path: '/dashboard/admin/reports' },
          ].map(({ Icon, label, path }) => (
            <a key={path} href={path}
              className="flex items-center gap-2.5 p-3 rounded-lg border border-fp-border hover:border-fp-gold/30 hover:bg-fp-gold-dim transition-colors group">
              <Icon className="w-4 h-4 text-fp-muted group-hover:text-fp-gold transition-colors" />
              <span className="text-fp-muted group-hover:text-fp-text text-xs transition-colors">{label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  </div>
);
