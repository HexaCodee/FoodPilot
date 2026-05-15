import { TableIcon, UtensilsIcon, BagIcon, CalendarIcon, BarChartIcon, CheckIcon } from '../../../shared/components/ui/Icons.jsx';

const StatCard = ({ Icon, label, value, sub }) => (
  <div className="bg-fp-surface border border-fp-border rounded-xl p-5 hover:border-fp-gold/25 transition-colors">
    <div className="p-2.5 rounded-lg bg-fp-gold-dim w-fit mb-4">
      <Icon className="w-5 h-5 text-fp-gold" />
    </div>
    <p className="text-fp-muted text-xs uppercase tracking-wide mb-1">{label}</p>
    <p className="text-fp-text text-2xl font-semibold">{value}</p>
    {sub && <p className="text-fp-subtle text-xs mt-1">{sub}</p>}
  </div>
);

const OrderRow = ({ item, qty, status }) => {
  const colors = {
    'En preparación': 'text-fp-gold bg-fp-gold-dim',
    'Listo': 'text-fp-success bg-fp-success-dim',
    'Entregado': 'text-fp-muted bg-fp-elevated',
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-fp-border-subtle last:border-0">
      <div>
        <p className="text-fp-text text-sm">{item}</p>
        <p className="text-fp-subtle text-xs">{qty} unidad{qty !== 1 ? 'es' : ''}</p>
      </div>
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${colors[status] ?? colors['En preparación']}`}>
        {status}
      </span>
    </div>
  );
};

export const RestaurantDashboard = () => (
  <div className="space-y-6 animate-fadeUp">
    <div>
      <h1 className="font-display text-2xl text-fp-text">Mi Restaurante</h1>
      <p className="text-fp-muted text-sm mt-0.5">Estado y actividad de tu establecimiento</p>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard Icon={TableIcon}    label="Mesas activas"       value="—" sub="Pendiente de integración" />
      <StatCard Icon={BagIcon}      label="Pedidos hoy"          value="—" sub="Pendiente de integración" />
      <StatCard Icon={CalendarIcon} label="Reservaciones hoy"    value="—" sub="Pendiente de integración" />
      <StatCard Icon={BarChartIcon} label="Ingresos del día"     value="—" sub="Pendiente de integración" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      {/* Recent orders */}
      <div className="bg-fp-surface border border-fp-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-fp-text font-medium text-sm">Pedidos recientes</h3>
          <BagIcon className="w-4 h-4 text-fp-subtle" />
        </div>
        <OrderRow item="Filete al carbón + Vino tinto" qty={1} status="En preparación" />
        <OrderRow item="Ensalada César + Agua mineral" qty={2} status="Listo" />
        <OrderRow item="Pasta al pesto"                qty={1} status="Entregado" />
        <OrderRow item="Postre: Tiramisú"              qty={3} status="En preparación" />
      </div>

      {/* Quick links */}
      <div className="bg-fp-surface border border-fp-border rounded-xl p-5">
        <h3 className="text-fp-text font-medium text-sm mb-4">Gestión rápida</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { Icon: TableIcon,    label: 'Gestionar mesas',   path: '/dashboard/restaurant/tables' },
            { Icon: UtensilsIcon, label: 'Editar menú',        path: '/dashboard/restaurant/menu' },
            { Icon: BagIcon,      label: 'Ver pedidos',        path: '/dashboard/restaurant/orders' },
            { Icon: CalendarIcon, label: 'Reservaciones',      path: '/dashboard/restaurant/reservations' },
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
