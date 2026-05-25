import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useRestaurantStore } from '../store/restaurantStore.js';
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '../../../shared/apis/promotions.js';
import {
  Modal,
  ModalActions,
  BtnPrimary,
  BtnSecondary,
} from '../../../shared/components/ui/Modal.jsx';
import { CreditCardIcon, BuildingIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const toInputDate = (iso) => {
  if (!iso) return '';
  return new Date(iso).toISOString().slice(0, 10);
};

// ── No restaurant selected ────────────────────────────────────────────────────
const NoRestaurant = () => (
  <div className='flex flex-col items-center justify-center py-20 text-center'>
    <div className='p-4 rounded-xl bg-fp-gold-dim mb-4'>
      <BuildingIcon className='w-8 h-8 text-fp-gold' />
    </div>
    <p className='text-fp-text font-medium text-lg'>Sin restaurante seleccionado</p>
    <p className='text-fp-subtle text-sm mt-2 max-w-xs'>
      Ve al dashboard y selecciona tu restaurante para gestionar sus promociones.
    </p>
  </div>
);

// ── Promotion form modal ──────────────────────────────────────────────────────
const PromotionModal = ({ item, restaurantId, onClose, onSaved }) => {
  const isEdit = !!item?._id;

  const EMPTY = {
    title: '',
    description: '',
    code: '',
    discount: 0,
    validFrom: '',
    validTo: '',
    isActive: true,
  };

  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title ?? '',
        description: item.description ?? '',
        code: item.code ?? '',
        discount: item.discount ?? 0,
        validFrom: toInputDate(item.validFrom),
        validTo: toInputDate(item.validTo),
        isActive: item.isActive ?? true,
      });
    } else {
      setForm(EMPTY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        restaurant: restaurantId,
        discount: Number(form.discount),
        validFrom: form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
        validTo: form.validTo ? new Date(form.validTo).toISOString() : undefined,
      };
      if (!payload.validFrom) delete payload.validFrom;
      if (!payload.validTo) delete payload.validTo;

      if (isEdit) {
        await updatePromotion(item._id, payload);
        toast.success('Promoción actualizada');
      } else {
        await createPromotion(payload);
        toast.success('Promoción creada');
      }
      onSaved();
      onClose();
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      const msg =
        Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors[0].msg
          : (err?.response?.data?.message ?? 'Error al guardar la promoción');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const f =
    'w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm placeholder-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors';
  const l = 'block text-fp-subtle text-xs mb-1';

  return (
    <Modal
      isOpen={!!item}
      onClose={onClose}
      title={isEdit ? 'Editar promoción' : 'Nueva promoción'}
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className={l}>Título *</label>
          <input
            className={f}
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            required
            maxLength={100}
          />
        </div>
        <div>
          <label className={l}>Descripción</label>
          <textarea
            rows={2}
            className={`${f} resize-none`}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            maxLength={500}
          />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className={l}>Código (opcional)</label>
            <input
              className={f}
              value={form.code}
              onChange={(e) => set('code', e.target.value.toUpperCase())}
              maxLength={20}
              placeholder='Ej. PROMO20'
            />
          </div>
          <div>
            <label className={l}>Descuento (%)</label>
            <input
              type='number'
              min='0'
              max='100'
              className={f}
              value={form.discount}
              onChange={(e) => set('discount', e.target.value)}
            />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className={l}>Válida desde</label>
            <input
              type='date'
              className={f}
              value={form.validFrom}
              onChange={(e) => set('validFrom', e.target.value)}
            />
          </div>
          <div>
            <label className={l}>Válida hasta</label>
            <input
              type='date'
              className={f}
              value={form.validTo}
              onChange={(e) => set('validTo', e.target.value)}
            />
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <input
            type='checkbox'
            id='promo-active'
            checked={form.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
            className='accent-fp-gold w-4 h-4'
          />
          <label htmlFor='promo-active' className='text-fp-text text-sm'>
            Promoción activa
          </label>
        </div>
        <ModalActions>
          <BtnSecondary onClick={onClose} disabled={saving}>
            Cancelar
          </BtnSecondary>
          <BtnPrimary type='submit' loading={saving}>
            {isEdit ? 'Guardar cambios' : 'Crear promoción'}
          </BtnPrimary>
        </ModalActions>
      </form>
    </Modal>
  );
};

// ── Delete confirm ────────────────────────────────────────────────────────────
const DeleteModal = ({ item, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const confirm = async () => {
    setLoading(true);
    try {
      await deletePromotion(item._id);
      toast.success('Promoción eliminada');
      onDeleted();
      onClose();
    } catch {
      toast.error('Error al eliminar la promoción');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={!!item} onClose={onClose} title='Eliminar promoción'>
      <p className='text-fp-muted text-sm mb-2'>
        ¿Confirmas que deseas eliminar <strong className='text-fp-text'>{item?.title}</strong>?
      </p>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={loading}>
          Cancelar
        </BtnSecondary>
        <button
          onClick={confirm}
          disabled={loading}
          className='px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors disabled:opacity-50'
        >
          {loading ? 'Eliminando…' : 'Sí, eliminar'}
        </button>
      </ModalActions>
    </Modal>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const RestaurantPromotionsPage = () => {
  const { selectedRestaurant } = useRestaurantStore();

  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalItem, setModalItem] = useState(null);
  const [deleteItem, setDeleteItem] = useState(null);

  const load = useCallback(async () => {
    if (!selectedRestaurant) return;
    setLoading(true);
    try {
      // The backend accepts ?restaurant=id to filter by restaurant
      const r = await getPromotions({ restaurantId: selectedRestaurant._id });
      setPromotions(Array.isArray(r.data?.data) ? r.data.data : []);
    } catch {
      toast.error('Error al cargar promociones');
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    load();
  }, [load]);

  if (!selectedRestaurant) return <NoRestaurant />;

  const now = new Date();

  return (
    <div className='space-y-6 animate-fadeUp'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='font-display text-2xl text-fp-text'>Promociones</h1>
          <p className='text-fp-muted text-sm mt-0.5'>
            {selectedRestaurant.name} ·{' '}
            {loading
              ? 'Cargando…'
              : `${promotions.length} promoción${promotions.length !== 1 ? 'es' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setModalItem({})}
          className='flex items-center gap-2 px-4 py-2 bg-fp-gold text-fp-bg text-sm font-medium rounded-lg hover:bg-fp-gold-hover transition-colors'
        >
          <CreditCardIcon className='w-4 h-4' />
          Nueva promoción
        </button>
      </div>

      {/* Table */}
      <div className='bg-fp-surface border border-fp-border rounded-xl overflow-hidden'>
        <div className='grid grid-cols-[1fr_100px_80px_90px_90px_80px_60px] gap-3 px-5 py-3 border-b border-fp-border bg-fp-elevated'>
          {['Título', 'Código', 'Desc.%', 'Desde', 'Hasta', 'Estado', ''].map((h) => (
            <span key={h} className='text-fp-muted text-xs font-medium uppercase tracking-wide'>
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div className='p-5 space-y-3'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        ) : promotions.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-fp-muted gap-3'>
            <CreditCardIcon className='w-10 h-10 opacity-30' />
            <p className='text-sm'>Sin promociones — crea la primera con el botón de arriba</p>
          </div>
        ) : (
          <div className='divide-y divide-fp-border-subtle'>
            {promotions.map((p) => {
              const expired = p.validTo && new Date(p.validTo) < now;
              return (
                <div
                  key={p._id}
                  className='grid grid-cols-[1fr_100px_80px_90px_90px_80px_60px] gap-3 px-5 py-3 items-center hover:bg-fp-elevated/50 transition-colors'
                >
                  <div>
                    <p
                      className={`text-sm font-medium truncate ${expired ? 'text-fp-muted' : 'text-fp-text'}`}
                    >
                      {p.title}
                    </p>
                    {p.description && (
                      <p className='text-fp-subtle text-xs truncate'>{p.description}</p>
                    )}
                  </div>
                  <p className='text-fp-muted text-sm font-mono'>{p.code || '—'}</p>
                  <p className='text-fp-text text-sm font-medium'>{p.discount}%</p>
                  <p className='text-fp-subtle text-xs'>{fmtDate(p.validFrom)}</p>
                  <p className={`text-xs ${expired ? 'text-red-400' : 'text-fp-subtle'}`}>
                    {fmtDate(p.validTo)}
                  </p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium w-fit ${
                      !p.isActive
                        ? 'bg-fp-elevated text-fp-muted'
                        : expired
                          ? 'bg-red-400/10 text-red-400'
                          : 'bg-fp-success-dim text-fp-success'
                    }`}
                  >
                    {!p.isActive ? 'Inactiva' : expired ? 'Expirada' : 'Activa'}
                  </span>
                  <div className='flex gap-2 justify-end'>
                    <button
                      onClick={() => setModalItem(p)}
                      className='text-xs text-fp-subtle hover:text-fp-gold transition-colors'
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => setDeleteItem(p)}
                      className='text-xs text-fp-subtle hover:text-red-400 transition-colors'
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <PromotionModal
        item={modalItem}
        restaurantId={selectedRestaurant._id}
        onClose={() => setModalItem(null)}
        onSaved={load}
      />
      <DeleteModal item={deleteItem} onClose={() => setDeleteItem(null)} onDeleted={load} />
    </div>
  );
};
