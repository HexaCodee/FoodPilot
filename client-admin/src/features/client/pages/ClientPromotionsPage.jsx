import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { getPromotions } from '../../../shared/apis/promotions.js';
import { getRestaurants } from '../../../shared/apis/restaurants.js';
import { CreditCardIcon, BuildingIcon, SearchIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const fmtDate = (d) => {
  if (!d) return null;
  return new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ── Promotion card ────────────────────────────────────────────────────────────
const PromotionCard = ({ promo, resName }) => {
  const expired = promo.validTo && new Date(promo.validTo) < new Date();

  return (
    <div className={`bg-fp-surface border rounded-xl p-5 transition-colors ${
      expired ? 'border-fp-border opacity-60' : 'border-fp-border hover:border-fp-gold/30'
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="text-fp-text font-medium text-sm truncate">{promo.title}</h4>
          {promo.description && (
            <p className="text-fp-muted text-xs mt-0.5 line-clamp-2">{promo.description}</p>
          )}
        </div>
        <div className="flex-shrink-0 bg-fp-gold-dim border border-fp-gold/20 rounded-lg px-3 py-1.5 text-center">
          <p className="text-fp-gold text-lg font-bold leading-none">{promo.discount}%</p>
          <p className="text-fp-gold text-xs">descuento</p>
        </div>
      </div>

      <div className="space-y-1.5">
        {resName && (
          <div className="flex items-center gap-1.5">
            <BuildingIcon className="w-3.5 h-3.5 text-fp-subtle flex-shrink-0" />
            <span className="text-fp-subtle text-xs">{resName}</span>
          </div>
        )}

        {promo.code && (
          <div className="flex items-center gap-2">
            <span className="text-fp-subtle text-xs">Código:</span>
            <code className="bg-fp-elevated px-2 py-0.5 rounded text-fp-gold text-xs font-bold tracking-wider">
              {promo.code}
            </code>
          </div>
        )}

        {(promo.validFrom || promo.validTo) && (
          <p className="text-fp-subtle text-xs">
            {promo.validFrom && `Desde ${fmtDate(promo.validFrom)}`}
            {promo.validFrom && promo.validTo && ' · '}
            {promo.validTo && `Hasta ${fmtDate(promo.validTo)}`}
          </p>
        )}
      </div>

      {expired && (
        <span className="mt-3 inline-block text-xs text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">
          Expirada
        </span>
      )}
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const ClientPromotionsPage = () => {
  const [promotions, setPromotions]   = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [showExpired, setShowExpired] = useState(false);

  useEffect(() => {
    Promise.all([
      getPromotions({ isActive: true }),
      getRestaurants({ isActive: true, limit: 50 }),
    ])
      .then(([pRes, rRes]) => {
        const promos = Array.isArray(pRes.data?.data) ? pRes.data.data : [];
        const rests  = Array.isArray(rRes.data?.data) ? rRes.data.data : [];
        setPromotions(promos);
        setRestaurants(rests);
      })
      .catch(() => toast.error('Error al cargar promociones'))
      .finally(() => setLoading(false));
  }, []);

  const resName = (promo) => {
    const id = promo.restaurant?._id ?? promo.restaurant;
    return restaurants.find((r) => r._id === id)?.name ?? null;
  };

  const now = new Date();
  const filtered = promotions
    .filter((p) => {
      const expired = p.validTo && new Date(p.validTo) < now;
      if (!showExpired && expired) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.title?.toLowerCase().includes(q) ||
          p.code?.toLowerCase().includes(q) ||
          resName(p)?.toLowerCase().includes(q)
        );
      }
      return true;
    });

  const activeCount  = promotions.filter((p) => !p.validTo || new Date(p.validTo) >= now).length;
  const expiredCount = promotions.filter((p) => p.validTo && new Date(p.validTo) < now).length;

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-fp-text">Promociones</h1>
        <p className="text-fp-muted text-sm mt-0.5">
          {loading ? 'Cargando…' : `${activeCount} activa${activeCount !== 1 ? 's' : ''} · ${expiredCount} expirada${expiredCount !== 1 ? 's' : ''}`}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-52">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fp-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar promoción…"
            className="w-full pl-9 pr-3 py-2 bg-fp-surface border border-fp-border rounded-lg text-fp-text text-sm placeholder-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors"
          />
        </div>
        <button
          onClick={() => setShowExpired((v) => !v)}
          className={`px-3 py-2 text-xs rounded-lg border transition-colors ${
            showExpired
              ? 'border-fp-gold/40 bg-fp-gold-dim text-fp-gold'
              : 'border-fp-border text-fp-muted hover:text-fp-text hover:border-fp-gold/30'
          }`}
        >
          {showExpired ? 'Ocultar expiradas' : 'Mostrar expiradas'}
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-xl bg-fp-gold-dim mb-4">
            <CreditCardIcon className="w-8 h-8 text-fp-gold" />
          </div>
          <p className="text-fp-text font-medium">Sin promociones</p>
          <p className="text-fp-subtle text-sm mt-1">
            {search ? 'No hay resultados para esa búsqueda' : 'No hay promociones disponibles en este momento'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <PromotionCard key={p._id} promo={p} resName={resName(p)} />
          ))}
        </div>
      )}
    </div>
  );
};
