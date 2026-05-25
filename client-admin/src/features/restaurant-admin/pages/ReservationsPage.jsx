import { useEffect, useState, useCallback } from 'react';
import { getReservations, cancelReservation, completeReservation } from '../../../shared/apis/reservations.js';
import { CalendarIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES = ['ACTIVA', 'CANCELADA', 'COMPLETADA'];
const STATUS_LABEL = { ACTIVA: 'Activa', CANCELADA: 'Cancelada', COMPLETADA: 'Completada' };
const STATUS_COLOR = {
  ACTIVA:     'text-fp-success bg-fp-success-dim',
  CANCELADA:  'text-red-400    bg-red-400/10',
  COMPLETADA: 'text-fp-muted   bg-fp-elevated',
};

const Skeleton = ({ className = '' }) => <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />;

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('es', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState('all');
  const [busy, setBusy]                 = useState({});

  const fetchReservations = useCallback(() => {
    setLoading(true);
    getReservations({ limit: 100 })
      .then((r) => { const d = r.data; setReservations(Array.isArray(d) ? d : (d?.reservations ?? [])); })
      .catch(() => setReservations([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchReservations(); }, [fetchReservations]);

  const handleAction = async (id, action) => {
    setBusy((p) => ({ ...p, [id]: action }));
    try {
      action === 'cancel' ? await cancelReservation(id) : await completeReservation(id);
      fetchReservations();
    } catch {
      // silently ignore
    } finally { setBusy((p) => ({ ...p, [id]: null })); }
  };

  const filtered = filter === 'all' ? reservations : reservations.filter((r) => r.status === filter);

  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-fp-text">Reservaciones</h1>
          <p className="text-fp-muted text-sm mt-0.5">{reservations.length} reserva{reservations.length !== 1 ? 's' : ''} en total</p>
        </div>
        <button onClick={fetchReservations}
          className="px-4 py-2 border border-fp-border text-fp-muted hover:text-fp-text hover:border-fp-gold/30 text-sm rounded-lg transition-colors">
          Actualizar
        </button>
      </div>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2">
        {['all', ...STATUSES].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s ? 'bg-fp-gold text-fp-bg' : 'bg-fp-elevated text-fp-muted hover:text-fp-text'
            }`}>
            {s === 'all' ? `Todas (${reservations.length})` : `${STATUS_LABEL[s]} (${reservations.filter((r) => r.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-fp-surface border border-fp-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-[80px_1fr_1fr_120px_160px] gap-4 px-5 py-3 border-b border-fp-border bg-fp-elevated">
          {['Mesa', 'Fecha reservada', 'Cliente (ID)', 'Estado', 'Acciones'].map((h) => (
            <span key={h} className="text-fp-muted text-xs font-medium uppercase tracking-wide">{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-fp-muted gap-3">
            <CalendarIcon className="w-10 h-10 opacity-30" />
            <p className="text-sm">No hay reservaciones {filter !== 'all' ? `con estado "${STATUS_LABEL[filter]}"` : ''}</p>
          </div>
        ) : (
          <div className="divide-y divide-fp-border-subtle">
            {filtered.map((res) => (
              <div key={res._id}
                className="grid grid-cols-[80px_1fr_1fr_120px_160px] gap-4 px-5 py-4 items-center hover:bg-fp-elevated/50 transition-colors">
                <p className="text-fp-text text-sm font-medium">Mesa {res.tableNumber}</p>
                <p className="text-fp-muted text-sm">{formatDate(res.reservedAt)}</p>
                <p className="text-fp-subtle text-xs font-mono truncate" title={res.userId ?? ''}>
                  {res.userId ? `…${res.userId.slice(-8)}` : '—'}
                </p>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full w-fit ${STATUS_COLOR[res.status] ?? STATUS_COLOR.ACTIVA}`}>
                  {STATUS_LABEL[res.status] ?? res.status}
                </span>

                {/* Actions — only show for ACTIVA */}
                <div className="flex gap-2">
                  {res.status === 'ACTIVA' && (
                    <>
                      <button
                        onClick={() => handleAction(res._id, 'complete')}
                        disabled={!!busy[res._id]}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-fp-success/30 text-fp-success hover:bg-fp-success-dim transition-colors disabled:opacity-50">
                        {busy[res._id] === 'complete' ? '...' : 'Completar'}
                      </button>
                      <button
                        onClick={() => handleAction(res._id, 'cancel')}
                        disabled={!!busy[res._id]}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-red-400/30 text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-50">
                        {busy[res._id] === 'cancel' ? '...' : 'Cancelar'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
