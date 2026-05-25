import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useRestaurantStore } from '../store/restaurantStore.js';
import {
  getSalesReports, getUsageStats,
} from '../../../shared/apis/events.js';
import { BarChartIcon, TrendUpIcon, ClipboardIcon, BuildingIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const fmtMoney = (n) =>
  typeof n === 'number'
    ? `$${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`
    : '—';

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

const PERIOD_LABEL = { 'DÍA': 'Día', 'SEMANA': 'Semana', 'MES': 'Mes', 'AÑO': 'Año' };

// ── CSV export ────────────────────────────────────────────────────────────────
const exportCSV = (rows, headers, filename) => {
  const escape = (v) => {
    const s = String(v ?? '').replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  };
  const lines = [headers.map(escape).join(','), ...rows.map((r) => r.map(escape).join(','))];
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

// ── CSS bar chart ─────────────────────────────────────────────────────────────
const BarChart = ({ data, valueKey, labelKey, color = 'bg-fp-gold', title }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d[valueKey] ?? 0), 1);
  return (
    <div className="bg-fp-surface border border-fp-border rounded-xl p-5">
      {title && <h3 className="text-fp-text font-medium text-sm mb-4">{title}</h3>}
      <div className="space-y-2">
        {data.map((d, i) => {
          const pct = Math.round(((d[valueKey] ?? 0) / max) * 100);
          return (
            <div key={i} className="flex items-center gap-3">
              <span className="text-fp-subtle text-xs w-20 truncate flex-shrink-0">{d[labelKey] ?? `#${i + 1}`}</span>
              <div className="flex-1 bg-fp-elevated rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
              </div>
              <span className="text-fp-muted text-xs w-16 text-right flex-shrink-0">{(d[valueKey] ?? 0).toLocaleString()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Summary card ──────────────────────────────────────────────────────────────
const SummaryCard = ({ Icon, label, value, sub }) => (
  <div className="bg-fp-surface border border-fp-border rounded-xl p-5 hover:border-fp-gold/25 transition-colors">
    <div className="p-2.5 rounded-lg bg-fp-gold-dim w-fit mb-3">
      <Icon className="w-5 h-5 text-fp-gold" />
    </div>
    <p className="text-fp-muted text-xs uppercase tracking-wide mb-1">{label}</p>
    <p className="text-fp-text text-2xl font-semibold">{value}</p>
    {sub && <p className="text-fp-subtle text-xs mt-1">{sub}</p>}
  </div>
);

// ── No restaurant selected ────────────────────────────────────────────────────
const NoRestaurant = () => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="p-4 rounded-xl bg-fp-gold-dim mb-4">
      <BuildingIcon className="w-8 h-8 text-fp-gold" />
    </div>
    <p className="text-fp-text font-medium text-lg">Sin restaurante seleccionado</p>
    <p className="text-fp-subtle text-sm mt-2 max-w-xs">
      Ve al dashboard y selecciona tu restaurante para ver los reportes.
    </p>
  </div>
);

// ── Sales Reports tab ─────────────────────────────────────────────────────────
const SalesTab = ({ restaurantId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getSalesReports();
      const all = Array.isArray(r.data) ? r.data : [];
      setReports(all.filter((rep) => String(rep.restaurantId) === String(restaurantId)));
    } catch {
      toast.error('Error al cargar reportes de ventas');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  const totalSales  = reports.reduce((s, r) => s + (r.totalSales  ?? 0), 0);
  const totalOrders = reports.reduce((s, r) => s + (r.totalOrders ?? 0), 0);
  const avgTicket   = reports.length > 0
    ? reports.reduce((s, r) => s + (r.averageTicket ?? 0), 0) / reports.length
    : 0;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard Icon={TrendUpIcon}   label="Ventas totales"  value={fmtMoney(totalSales)}  sub={`${reports.length} reporte${reports.length !== 1 ? 's' : ''}`} />
        <SummaryCard Icon={ClipboardIcon} label="Pedidos totales" value={totalOrders.toLocaleString()} sub="Suma de reportes" />
        <SummaryCard Icon={BarChartIcon}  label="Ticket promedio" value={fmtMoney(avgTicket)}   sub="Promedio entre reportes" />
      </div>

      {!loading && reports.length > 0 && (
        <BarChart
          data={reports.map((r) => ({
            label: `${PERIOD_LABEL[r.period?.type] ?? r.period?.type ?? '?'}${r.period?.year ? ` ${r.period.year}` : ''}`,
            value: r.totalSales ?? 0,
          }))}
          valueKey="value"
          labelKey="label"
          title="Ventas por período"
          color="bg-fp-gold"
        />
      )}

      <div className="bg-fp-surface border border-fp-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-fp-border flex items-center justify-between">
          <h3 className="text-fp-text font-medium text-sm">Reportes de ventas</h3>
          <div className="flex items-center gap-3">
            <span className="text-fp-subtle text-xs">{loading ? '…' : `${reports.length} registros`}</span>
            {!loading && reports.length > 0 && (
              <button
                onClick={() => exportCSV(
                  reports.map((r) => [
                    `${PERIOD_LABEL[r.period?.type] ?? r.period?.type ?? '—'}${r.period?.month ? ` mes ${r.period.month}` : ''}${r.period?.year ? ` ${r.period.year}` : ''}`,
                    r.totalSales ?? 0,
                    r.totalOrders ?? 0,
                    r.averageTicket ?? 0,
                    fmtDate(r.generatedAt),
                  ]),
                  ['Período', 'Ventas totales', 'Pedidos', 'Ticket promedio', 'Generado'],
                  'reportes_ventas.csv'
                )}
                className="text-xs text-fp-gold hover:text-fp-gold-hover font-medium transition-colors"
              >
                Exportar CSV
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : reports.length === 0 ? (
          <p className="text-fp-subtle text-sm text-center py-10">Sin reportes de ventas para este restaurante</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fp-border bg-fp-bg">
                  {['Período', 'Ventas totales', 'Pedidos', 'Ticket prom.', 'Generado'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-fp-subtle uppercase tracking-wide font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-fp-border-subtle">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-fp-elevated/50 transition-colors">
                    <td className="px-4 py-3 text-fp-muted">
                      {PERIOD_LABEL[r.period?.type] ?? r.period?.type ?? '—'}
                      {r.period?.month ? ` · mes ${r.period.month}` : ''}
                      {r.period?.year  ? ` ${r.period.year}`        : ''}
                    </td>
                    <td className="px-4 py-3 text-fp-text font-semibold">{fmtMoney(r.totalSales)}</td>
                    <td className="px-4 py-3 text-fp-muted">{r.totalOrders}</td>
                    <td className="px-4 py-3 text-fp-muted">{fmtMoney(r.averageTicket)}</td>
                    <td className="px-4 py-3 text-fp-subtle text-xs">{fmtDate(r.generatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Usage Stats tab ───────────────────────────────────────────────────────────
const UsageTab = ({ restaurantId }) => {
  const [stats, setStats]   = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getUsageStats();
      const all = Array.isArray(r.data) ? r.data : [];
      setStats(all.filter((s) => String(s.restaurantId) === String(restaurantId)));
    } catch {
      toast.error('Error al cargar estadísticas de uso');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { load(); }, [load]);

  const totalReservations = stats.reduce((s, r) => s + (r.reservationsCount ?? 0), 0);
  const totalNewUsers     = stats.reduce((s, r) => s + (r.newUsers       ?? 0), 0);
  const totalRepeat       = stats.reduce((s, r) => s + (r.repeatUsers    ?? 0), 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard Icon={ClipboardIcon} label="Reservas totales"     value={totalReservations.toLocaleString()} sub={`${stats.length} registro${stats.length !== 1 ? 's' : ''}`} />
        <SummaryCard Icon={TrendUpIcon}   label="Nuevos usuarios"      value={totalNewUsers.toLocaleString()} sub="Suma de períodos" />
        <SummaryCard Icon={BarChartIcon}  label="Usuarios recurrentes" value={totalRepeat.toLocaleString()}   sub="Suma de períodos" />
      </div>

      {!loading && stats.length > 0 && (
        <BarChart
          data={stats.map((s) => ({
            label: PERIOD_LABEL[s.period?.type] ?? s.period?.type ?? '?',
            value: s.reservationsCount ?? 0,
          }))}
          valueKey="value"
          labelKey="label"
          title="Reservas por período"
          color="bg-blue-500"
        />
      )}

      <div className="bg-fp-surface border border-fp-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-fp-border flex items-center justify-between">
          <h3 className="text-fp-text font-medium text-sm">Estadísticas de uso</h3>
          <div className="flex items-center gap-3">
            <span className="text-fp-subtle text-xs">{loading ? '…' : `${stats.length} registros`}</span>
            {!loading && stats.length > 0 && (
              <button
                onClick={() => exportCSV(
                  stats.map((s) => [
                    PERIOD_LABEL[s.period?.type] ?? s.period?.type ?? '—',
                    s.reservationsCount ?? 0,
                    s.eventReservations ?? 0,
                    s.mostBusyHour ?? '—',
                    s.newUsers ?? 0,
                    s.repeatUsers ?? 0,
                  ]),
                  ['Período', 'Reservas', 'Ev. Reservas', 'Hora pico', 'Nuevos usuarios', 'Usuarios recurrentes'],
                  'estadisticas_uso.csv'
                )}
                className="text-xs text-fp-gold hover:text-fp-gold-hover font-medium transition-colors"
              >
                Exportar CSV
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : stats.length === 0 ? (
          <p className="text-fp-subtle text-sm text-center py-10">Sin estadísticas de uso para este restaurante</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fp-border bg-fp-bg">
                  {['Período', 'Reservas', 'Ev. Reservas', 'Hora pico', 'Nuevos', 'Recurrentes'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-fp-subtle uppercase tracking-wide font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-fp-border-subtle">
                {stats.map((s) => (
                  <tr key={s._id} className="hover:bg-fp-elevated/50 transition-colors">
                    <td className="px-4 py-3 text-fp-muted">{PERIOD_LABEL[s.period?.type] ?? s.period?.type ?? '—'}</td>
                    <td className="px-4 py-3 text-fp-text">{s.reservationsCount ?? 0}</td>
                    <td className="px-4 py-3 text-fp-muted">{s.eventReservations ?? 0}</td>
                    <td className="px-4 py-3 text-fp-muted">{s.mostBusyHour ?? '—'}</td>
                    <td className="px-4 py-3 text-fp-muted">{s.newUsers    ?? 0}</td>
                    <td className="px-4 py-3 text-fp-muted">{s.repeatUsers ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const TABS = ['Ventas', 'Uso'];

export const RestaurantReportsPage = () => {
  const { selectedRestaurant } = useRestaurantStore();
  const [tab, setTab] = useState('Ventas');

  if (!selectedRestaurant) return <NoRestaurant />;

  return (
    <div className="space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display text-2xl text-fp-text">Reportes</h1>
        <p className="text-fp-muted text-sm mt-0.5">
          {selectedRestaurant.name} · {selectedRestaurant.category}
        </p>
      </div>

      {/* Tabs + print */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-1 bg-fp-elevated p-1 rounded-lg w-fit">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                tab === t
                  ? 'bg-fp-surface text-fp-text shadow-sm'
                  : 'text-fp-muted hover:text-fp-text'
              }`}>
              {t === 'Ventas' ? 'Reportes de ventas' : 'Estadísticas de uso'}
            </button>
          ))}
        </div>
        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 text-xs text-fp-muted border border-fp-border rounded-lg hover:text-fp-text hover:border-fp-gold/30 transition-colors"
        >
          Imprimir / PDF
        </button>
      </div>

      {tab === 'Ventas'
        ? <SalesTab   restaurantId={selectedRestaurant._id} />
        : <UsageTab   restaurantId={selectedRestaurant._id} />
      }
    </div>
  );
};
