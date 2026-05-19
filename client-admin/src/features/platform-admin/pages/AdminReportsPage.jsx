import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getSalesReports, deleteSalesReport,
  getUsageStats,  deleteUsageStats,
} from '../../../shared/apis/events.js';
import { BarChartIcon, TrendUpIcon, ClipboardIcon } from '../../../shared/components/ui/Icons.jsx';
import { Modal, ModalActions, BtnSecondary } from '../../../shared/components/ui/Modal.jsx';

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

// ── Summary cards at top ──────────────────────────────────────────────────────
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

// ── Delete confirm ────────────────────────────────────────────────────────────
const DeleteModal = ({ item, label, onClose, onDeleted, deleteFn }) => {
  const [loading, setLoading] = useState(false);
  const confirm = async () => {
    setLoading(true);
    try {
      await deleteFn(item._id);
      toast.success(`${label} eliminado`);
      onDeleted();
      onClose();
    } catch {
      toast.error(`Error al eliminar ${label.toLowerCase()}`);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={!!item} onClose={onClose} title={`Eliminar ${label}`}>
      <p className="text-fp-muted text-sm mb-2">¿Confirmas que deseas eliminar este registro?</p>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={loading}>Cancelar</BtnSecondary>
        <button
          onClick={confirm}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Eliminando…' : 'Sí, eliminar'}
        </button>
      </ModalActions>
    </Modal>
  );
};

// ── Sales Reports tab ─────────────────────────────────────────────────────────
const SalesReportsTab = () => {
  const [reports, setReports]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getSalesReports();
      setReports(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error('Error al cargar reportes de ventas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalSales  = reports.reduce((s, r) => s + (r.totalSales  ?? 0), 0);
  const totalOrders = reports.reduce((s, r) => s + (r.totalOrders ?? 0), 0);
  const avgTicket   = reports.length > 0
    ? reports.reduce((s, r) => s + (r.averageTicket ?? 0), 0) / reports.length
    : 0;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard Icon={TrendUpIcon}  label="Ventas totales"   value={fmtMoney(totalSales)}  sub={`${reports.length} reporte${reports.length !== 1 ? 's' : ''}`} />
        <SummaryCard Icon={ClipboardIcon} label="Pedidos totales" value={totalOrders.toLocaleString()} sub="Suma de todos los reportes" />
        <SummaryCard Icon={BarChartIcon}  label="Ticket promedio"  value={fmtMoney(avgTicket)}   sub="Promedio entre reportes" />
      </div>

      {/* Table */}
      <div className="bg-fp-surface border border-fp-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-fp-border flex items-center justify-between">
          <h3 className="text-fp-text font-medium text-sm">Reportes de ventas</h3>
          <span className="text-fp-subtle text-xs">{loading ? '…' : `${reports.length} registros`}</span>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : reports.length === 0 ? (
          <p className="text-fp-subtle text-sm text-center py-10">Sin reportes registrados aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fp-border bg-fp-bg">
                  {['Restaurante', 'Período', 'Ventas totales', 'Pedidos', 'Ticket prom.', 'Generado', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-fp-subtle uppercase tracking-wide font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-fp-border-subtle">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-fp-elevated/50 transition-colors">
                    <td className="px-4 py-3 text-fp-text font-medium">{r.restaurantId?.toString?.() ?? '—'}</td>
                    <td className="px-4 py-3 text-fp-muted">
                      {PERIOD_LABEL[r.period?.type] ?? r.period?.type ?? '—'}
                      {r.period?.month ? ` · mes ${r.period.month}` : ''}
                      {r.period?.year  ? ` ${r.period.year}`         : ''}
                    </td>
                    <td className="px-4 py-3 text-fp-text font-semibold">{fmtMoney(r.totalSales)}</td>
                    <td className="px-4 py-3 text-fp-muted">{r.totalOrders}</td>
                    <td className="px-4 py-3 text-fp-muted">{fmtMoney(r.averageTicket)}</td>
                    <td className="px-4 py-3 text-fp-subtle text-xs">{fmtDate(r.generatedAt)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleting(r)}
                        className="text-xs text-fp-subtle hover:text-red-400 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleting && (
        <DeleteModal
          item={deleting}
          label="Reporte"
          onClose={() => setDeleting(null)}
          onDeleted={load}
          deleteFn={deleteSalesReport}
        />
      )}
    </div>
  );
};

// ── Usage Stats tab ───────────────────────────────────────────────────────────
const UsageStatsTab = () => {
  const [stats, setStats]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getUsageStats();
      setStats(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error('Error al cargar estadísticas de uso');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const totalReservations = stats.reduce((s, r) => s + (r.reservationsCount ?? 0), 0);
  const totalNewUsers     = stats.reduce((s, r) => s + (r.newUsers ?? 0), 0);
  const totalRepeat       = stats.reduce((s, r) => s + (r.repeatUsers ?? 0), 0);

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard Icon={ClipboardIcon} label="Reservas totales"  value={totalReservations.toLocaleString()} sub={`${stats.length} registro${stats.length !== 1 ? 's' : ''}`} />
        <SummaryCard Icon={TrendUpIcon}   label="Nuevos usuarios"   value={totalNewUsers.toLocaleString()}     sub="Suma de todos los períodos" />
        <SummaryCard Icon={BarChartIcon}  label="Usuarios recurrentes" value={totalRepeat.toLocaleString()}    sub="Suma de todos los períodos" />
      </div>

      {/* Table */}
      <div className="bg-fp-surface border border-fp-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-fp-border flex items-center justify-between">
          <h3 className="text-fp-text font-medium text-sm">Estadísticas de uso</h3>
          <span className="text-fp-subtle text-xs">{loading ? '…' : `${stats.length} registros`}</span>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : stats.length === 0 ? (
          <p className="text-fp-subtle text-sm text-center py-10">Sin estadísticas registradas aún</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fp-border bg-fp-bg">
                  {['Restaurante', 'Período', 'Reservas', 'Ev. Reservas', 'Hora pico', 'Nuevos', 'Recurrentes', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-fp-subtle uppercase tracking-wide font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-fp-border-subtle">
                {stats.map((s) => (
                  <tr key={s._id} className="hover:bg-fp-elevated/50 transition-colors">
                    <td className="px-4 py-3 text-fp-text font-medium">{s.restaurantId?.toString?.() ?? '—'}</td>
                    <td className="px-4 py-3 text-fp-muted">
                      {PERIOD_LABEL[s.period?.type] ?? s.period?.type ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-fp-text">{s.reservationsCount ?? 0}</td>
                    <td className="px-4 py-3 text-fp-muted">{s.eventReservations ?? 0}</td>
                    <td className="px-4 py-3 text-fp-muted">{s.mostBusyHour ?? '—'}</td>
                    <td className="px-4 py-3 text-fp-muted">{s.newUsers ?? 0}</td>
                    <td className="px-4 py-3 text-fp-muted">{s.repeatUsers ?? 0}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleting(s)}
                        className="text-xs text-fp-subtle hover:text-red-400 transition-colors"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deleting && (
        <DeleteModal
          item={deleting}
          label="Estadística"
          onClose={() => setDeleting(null)}
          onDeleted={load}
          deleteFn={deleteUsageStats}
        />
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const TABS = ['Ventas', 'Uso'];

export const AdminReportsPage = () => {
  const [tab, setTab] = useState('Ventas');

  return (
    <div className="space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display text-2xl text-fp-text">Reportes y Estadísticas</h1>
        <p className="text-fp-muted text-sm mt-0.5">Métricas de ventas y uso de la plataforma</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-fp-elevated p-1 rounded-lg w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-fp-surface text-fp-text shadow-sm'
                : 'text-fp-muted hover:text-fp-text'
            }`}
          >
            {t === 'Ventas' ? 'Reportes de ventas' : 'Estadísticas de uso'}
          </button>
        ))}
      </div>

      {tab === 'Ventas' ? <SalesReportsTab /> : <UsageStatsTab />}
    </div>
  );
};
