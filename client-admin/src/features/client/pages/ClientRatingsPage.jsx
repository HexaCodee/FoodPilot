import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore.js';
import { getRestaurants } from '../../../shared/apis/restaurants.js';
import { getRatings, createRating, deleteRating } from '../../../shared/apis/ratings.js';
import { StarIcon, BuildingIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const StarRating = ({ value, onChange, readOnly = false }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type={readOnly ? 'button' : 'button'}
        disabled={readOnly}
        onClick={() => !readOnly && onChange?.(star)}
        className={`transition-colors ${readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'}`}
      >
        <StarIcon
          className={`w-5 h-5 ${star <= value ? 'text-fp-gold fill-fp-gold' : 'text-fp-border'}`}
          style={{ fill: star <= value ? 'currentColor' : 'none' }}
        />
      </button>
    ))}
  </div>
);

const fmtDate = (d) => d
  ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

// ── Rating form ───────────────────────────────────────────────────────────────
const RatingForm = ({ restaurantId, userId, existing, onSaved }) => {
  const [rating, setRating]   = useState(existing?.rating ?? 0);
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [saving, setSaving]   = useState(false);

  useEffect(() => {
    setRating(existing?.rating ?? 0);
    setComment(existing?.comment ?? '');
  }, [existing, restaurantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Selecciona una calificación'); return; }
    setSaving(true);
    try {
      await createRating({ restaurantId, userId, rating, comment: comment.trim() || undefined });
      toast.success(existing ? 'Calificación actualizada' : 'Calificación enviada');
      onSaved();
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      const msg = Array.isArray(apiErrors) && apiErrors.length > 0
        ? apiErrors[0].msg
        : (err?.response?.data?.message ?? 'Error al guardar la calificación');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const fieldCls = 'w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm placeholder-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors resize-none';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-fp-subtle text-xs mb-2">Tu calificación *</p>
        <StarRating value={rating} onChange={setRating} />
      </div>
      <div>
        <p className="text-fp-subtle text-xs mb-1">Comentario (opcional)</p>
        <textarea
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Describe tu experiencia…"
          maxLength={300}
          className={fieldCls}
        />
      </div>
      <button
        type="submit"
        disabled={saving || rating === 0}
        className="px-4 py-2 bg-fp-gold text-fp-bg text-sm font-medium rounded-lg hover:bg-fp-gold-hover transition-colors disabled:opacity-50"
      >
        {saving ? 'Guardando…' : existing ? 'Actualizar calificación' : 'Enviar calificación'}
      </button>
    </form>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const ClientRatingsPage = () => {
  const user = useAuthStore((s) => s.user);

  const [restaurants, setRestaurants]       = useState([]);
  const [selected, setSelected]             = useState('');
  const [ratings, setRatings]               = useState([]);
  const [myRating, setMyRating]             = useState(null);
  const [loadingRes, setLoadingRes]         = useState(true);
  const [loadingRatings, setLoadingRatings] = useState(false);
  const [deleting, setDeleting]             = useState(null);

  // Load (or reload) the restaurant list — called after rating changes to update avg
  const loadRestaurants = useCallback(async (keepSelected) => {
    try {
      const r = await getRestaurants({ isActive: true, limit: 50 });
      const list = r.data?.data ?? [];
      setRestaurants(list);
      // Only set selected on first load (when keepSelected is falsy)
      if (!keepSelected && list.length > 0) setSelected(list[0]._id);
    } catch {
      toast.error('Error al cargar restaurantes');
    } finally {
      setLoadingRes(false);
    }
  }, []);

  useEffect(() => { loadRestaurants(false); }, [loadRestaurants]);

  const loadRatings = useCallback(async () => {
    if (!selected) return;
    setLoadingRatings(true);
    try {
      const r = await getRatings({ restaurant: selected });
      const all = Array.isArray(r.data?.data) ? r.data.data : (Array.isArray(r.data) ? r.data : []);
      setRatings(all);
      setMyRating(all.find((rt) => rt.userId === user?.id) ?? null);
    } catch {
      toast.error('Error al cargar calificaciones');
    } finally {
      setLoadingRatings(false);
    }
  }, [selected, user?.id]);

  useEffect(() => { loadRatings(); }, [loadRatings]);

  // Called after a rating is saved — reload both so the card avg updates
  const handleRatingSaved = useCallback(() => {
    loadRatings();
    loadRestaurants(true); // keep current selection
  }, [loadRatings, loadRestaurants]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteRating(id);
      toast.success('Calificación eliminada');
      loadRatings();
      loadRestaurants(true);
    } catch {
      toast.error('Error al eliminar la calificación');
    } finally {
      setDeleting(null);
    }
  };

  const selectedRes = restaurants.find((r) => r._id === selected);
  const othersRatings = ratings.filter((rt) => rt.userId !== user?.id);

  return (
    <div className="space-y-6 animate-fadeUp">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-fp-text">Calificaciones</h1>
        <p className="text-fp-muted text-sm mt-0.5">Califica tu experiencia en los restaurantes</p>
      </div>

      {/* Restaurant picker */}
      <div className="bg-fp-surface border border-fp-border rounded-xl p-5">
        <label className="block text-fp-subtle text-xs mb-2">Seleccionar restaurante</label>
        {loadingRes ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm focus:outline-none focus:border-fp-gold/50 transition-colors"
          >
            {restaurants.map((r) => (
              <option key={r._id} value={r._id}>{r.name}</option>
            ))}
          </select>
        )}

        {selectedRes && (
          <div className="mt-3 flex items-center gap-2">
            <BuildingIcon className="w-4 h-4 text-fp-subtle flex-shrink-0" />
            <span className="text-fp-subtle text-xs">{selectedRes.category}</span>
            {selectedRes.rating != null && (
              <span className="ml-auto flex items-center gap-1 text-fp-gold text-xs font-medium">
                <StarIcon className="w-3.5 h-3.5" />
                {Number(selectedRes.rating).toFixed(1)} · {selectedRes.reviewCount ?? 0} reseñas
              </span>
            )}
          </div>
        )}
      </div>

      {/* My rating */}
      <div className="bg-fp-surface border border-fp-border rounded-xl p-5">
        <h3 className="text-fp-text font-medium text-sm mb-4">
          {myRating ? 'Tu calificación' : 'Deja tu calificación'}
        </h3>
        {selected ? (
          <RatingForm
            restaurantId={selected}
            userId={user?.id}
            existing={myRating}
            onSaved={handleRatingSaved}
          />
        ) : (
          <p className="text-fp-subtle text-sm">Selecciona un restaurante para calificar.</p>
        )}
        {myRating && (
          <button
            onClick={() => handleDelete(myRating._id)}
            disabled={deleting === myRating._id}
            className="mt-3 text-xs text-fp-subtle hover:text-red-400 transition-colors"
          >
            {deleting === myRating._id ? 'Eliminando…' : 'Eliminar mi calificación'}
          </button>
        )}
      </div>

      {/* Other ratings */}
      <div className="bg-fp-surface border border-fp-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-fp-border">
          <h3 className="text-fp-text font-medium text-sm">
            Reseñas de otros usuarios
            {!loadingRatings && <span className="text-fp-subtle font-normal ml-2">({othersRatings.length})</span>}
          </h3>
        </div>

        {loadingRatings ? (
          <div className="p-5 space-y-3">
            {[1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : othersRatings.length === 0 ? (
          <p className="text-fp-subtle text-sm text-center py-10">Sin reseñas de otros usuarios aún</p>
        ) : (
          <div className="divide-y divide-fp-border-subtle">
            {othersRatings.map((rt) => (
              <div key={rt._id} className="px-5 py-4">
                <div className="flex items-center justify-between mb-1">
                  <StarRating value={rt.rating} readOnly />
                  <span className="text-fp-subtle text-xs">{fmtDate(rt.createdAt)}</span>
                </div>
                {rt.comment && (
                  <p className="text-fp-muted text-sm mt-1">{rt.comment}</p>
                )}
                <p className="text-fp-subtle text-xs mt-1 font-mono">…{rt.userId?.slice(-6) ?? '—'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
