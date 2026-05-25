import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getEvents } from '../../../shared/apis/events.js';
import { CalendarIcon, BuildingIcon, MapPinIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
};

// ── Event card ────────────────────────────────────────────────────────────────
const EventCard = ({ event }) => (
  <div className="bg-fp-surface border border-fp-border rounded-xl p-5 hover:border-fp-gold/30 transition-colors">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="p-2.5 rounded-lg bg-fp-gold-dim flex-shrink-0">
        <CalendarIcon className="w-4 h-4 text-fp-gold" />
      </div>
      <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-fp-success-dim text-fp-success">
        Activo
      </span>
    </div>
    <h4 className="text-fp-text font-medium text-sm mb-1">{event.name}</h4>
    {event.description && (
      <p className="text-fp-subtle text-xs mb-3 line-clamp-2">{event.description}</p>
    )}
    <div className="space-y-1.5">
      {event.restaurant?.name && (
        <div className="flex items-center gap-1.5">
          <BuildingIcon className="w-3.5 h-3.5 text-fp-subtle flex-shrink-0" />
          <span className="text-fp-muted text-xs">{event.restaurant.name}</span>
        </div>
      )}
      {event.date && (
        <div className="flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-fp-subtle flex-shrink-0" />
          <span className="text-fp-muted text-xs">{fmtDate(event.date)}</span>
        </div>
      )}
      {event.location && (
        <div className="flex items-center gap-1.5">
          <MapPinIcon className="w-3.5 h-3.5 text-fp-subtle flex-shrink-0" />
          <span className="text-fp-muted text-xs">{event.location}</span>
        </div>
      )}
    </div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
export const ClientEventsPage = () => {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    getEvents()
      .then((r) => {
        const all = Array.isArray(r.data) ? r.data : [];
        setEvents(all.filter((e) => e.status === 'ACTIVO'));
      })
      .catch(() => toast.error('Error al cargar eventos'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter((e) =>
    !search || e.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeUp">
      <div>
        <h1 className="font-display text-2xl text-fp-text">Eventos</h1>
        <p className="text-fp-muted text-sm mt-0.5">
          {loading ? 'Cargando…' : `${filtered.length} evento${filtered.length !== 1 ? 's' : ''} activo${filtered.length !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Buscar eventos…"
        className="w-full bg-fp-surface border border-fp-border rounded-lg px-4 py-2.5 text-fp-text text-sm placeholder-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors"
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-xl bg-fp-gold-dim mb-4">
            <CalendarIcon className="w-8 h-8 text-fp-gold" />
          </div>
          <p className="text-fp-text font-medium text-lg">Sin eventos</p>
          <p className="text-fp-subtle text-sm mt-2 max-w-xs">
            {search ? 'No se encontraron eventos con ese nombre.' : 'No hay eventos activos en este momento.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => <EventCard key={e._id} event={e} />)}
        </div>
      )}
    </div>
  );
};
