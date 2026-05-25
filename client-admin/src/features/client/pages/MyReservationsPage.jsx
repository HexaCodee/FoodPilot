import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore.js';
import {
  getReservations,
  createReservation,
  cancelReservation,
  updateReservation,
} from '../../../shared/apis/reservations.js';
import {
  Modal,
  ModalActions,
  BtnPrimary,
  BtnSecondary,
} from '../../../shared/components/ui/Modal.jsx';
import { CalendarIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const fmtDateTime = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const STATUS_STYLE = {
  ACTIVA: 'bg-fp-success-dim text-fp-success',
  CANCELADA: 'bg-red-900/30    text-red-400',
  COMPLETADA: 'bg-fp-elevated   text-fp-muted',
};

const TABS = ['Todas', 'ACTIVA', 'CANCELADA', 'COMPLETADA'];

// ── Create reservation modal ──────────────────────────────────────────────────
const CreateReservationModal = ({ isOpen, onClose, onCreated, userId }) => {
  const [form, setForm] = useState({ tableNumber: '', reservedAt: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({ tableNumber: '', reservedAt: '' });
  }, [isOpen]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createReservation({
        tableNumber: form.tableNumber.trim(),
        reservedAt: new Date(form.reservedAt).toISOString(),
        userId: userId,
      });
      toast.success('Reserva creada');
      onCreated();
      onClose();
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      const msg =
        Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors[0].msg
          : (err?.response?.data?.message ?? 'Error al crear la reserva');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm placeholder-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors';
  const label = 'block text-fp-subtle text-xs mb-1';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Nueva reserva'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className={label}>Número de mesa *</label>
          <input
            className={field}
            value={form.tableNumber}
            onChange={(e) => set('tableNumber', e.target.value)}
            placeholder='Ej. 5'
            required
          />
        </div>
        <div>
          <label className={label}>Fecha y hora *</label>
          <input
            type='datetime-local'
            className={field}
            value={form.reservedAt}
            onChange={(e) => set('reservedAt', e.target.value)}
            required
          />
        </div>
        <ModalActions>
          <BtnSecondary onClick={onClose} disabled={saving}>
            Cancelar
          </BtnSecondary>
          <BtnPrimary type='submit' loading={saving}>
            Reservar
          </BtnPrimary>
        </ModalActions>
      </form>
    </Modal>
  );
};

// ── Edit reservation modal ────────────────────────────────────────────────────
const EditReservationModal = ({ reservation, onClose, onUpdated }) => {
  const toLocal = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [form, setForm] = useState({
    tableNumber: reservation?.tableNumber ?? '',
    reservedAt: toLocal(reservation?.reservedAt),
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (reservation)
      setForm({
        tableNumber: reservation.tableNumber ?? '',
        reservedAt: toLocal(reservation.reservedAt),
      });
  }, [reservation]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateReservation(reservation._id, {
        tableNumber: form.tableNumber.trim(),
        reservedAt: new Date(form.reservedAt).toISOString(),
      });
      toast.success('Reserva actualizada');
      onUpdated();
      onClose();
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      const msg =
        Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors[0].msg
          : (err?.response?.data?.message ?? 'Error al actualizar la reserva');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const fieldCls =
    'w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm placeholder-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors';
  const labelCls = 'block text-fp-subtle text-xs mb-1';

  return (
    <Modal isOpen={!!reservation} onClose={onClose} title='Editar reserva'>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className={labelCls}>Número de mesa *</label>
          <input
            className={fieldCls}
            value={form.tableNumber}
            onChange={(e) => set('tableNumber', e.target.value)}
            required
          />
        </div>
        <div>
          <label className={labelCls}>Fecha y hora *</label>
          <input
            type='datetime-local'
            className={fieldCls}
            value={form.reservedAt}
            onChange={(e) => set('reservedAt', e.target.value)}
            required
          />
        </div>
        <ModalActions>
          <BtnSecondary onClick={onClose} disabled={saving}>
            Cancelar
          </BtnSecondary>
          <BtnPrimary type='submit' loading={saving}>
            Guardar cambios
          </BtnPrimary>
        </ModalActions>
      </form>
    </Modal>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const MyReservationsPage = () => {
  const user = useAuthStore((s) => s.user);

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ACTIVA');
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getReservations({ userId: user?.id });
      setReservations(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (res) => {
    setCancelling(res._id);
    try {
      await cancelReservation(res._id);
      toast.success('Reserva cancelada');
      load();
    } catch {
      toast.error('Error al cancelar la reserva');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = tab === 'Todas' ? reservations : reservations.filter((r) => r.status === tab);

  const counts = TABS.reduce((acc, t) => {
    acc[t] =
      t === 'Todas' ? reservations.length : reservations.filter((r) => r.status === t).length;
    return acc;
  }, {});

  return (
    <div className='space-y-6 animate-fadeUp'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='font-display text-2xl text-fp-text'>Mis Reservaciones</h1>
          <p className='text-fp-muted text-sm mt-0.5'>
            {loading
              ? 'Cargando…'
              : `${reservations.length} reserva${reservations.length !== 1 ? 's' : ''} registrada${reservations.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className='flex items-center gap-2 px-4 py-2 bg-fp-gold text-fp-bg text-sm font-medium rounded-lg hover:bg-fp-gold-hover transition-colors'
        >
          <CalendarIcon className='w-4 h-4' />
          Nueva reserva
        </button>
      </div>

      {/* Status tabs */}
      <div className='flex gap-1 bg-fp-elevated p-1 rounded-lg w-fit flex-wrap'>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === t
                ? 'bg-fp-surface text-fp-text shadow-sm'
                : 'text-fp-muted hover:text-fp-text'
            }`}
          >
            {t === 'Todas' ? 'Todas' : t.charAt(0) + t.slice(1).toLowerCase()} ({counts[t]})
          </button>
        ))}
      </div>

      {/* List */}
      <div className='bg-fp-surface border border-fp-border rounded-xl overflow-hidden'>
        {loading ? (
          <div className='p-5 space-y-3'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-16 w-full' />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <CalendarIcon className='w-10 h-10 text-fp-muted mb-3' />
            <p className='text-fp-text font-medium'>Sin reservas</p>
            <p className='text-fp-subtle text-sm mt-1'>
              {tab !== 'Todas'
                ? `No hay reservas ${tab.toLowerCase()}s`
                : 'Crea tu primera reserva con el botón de arriba'}
            </p>
          </div>
        ) : (
          <div className='divide-y divide-fp-border-subtle'>
            {filtered.map((res) => (
              <div
                key={res._id}
                className='flex items-center justify-between px-5 py-4 hover:bg-fp-elevated/50 transition-colors'
              >
                <div className='flex items-center gap-4'>
                  <div className='p-2.5 rounded-lg bg-fp-gold-dim flex-shrink-0'>
                    <CalendarIcon className='w-4 h-4 text-fp-gold' />
                  </div>
                  <div>
                    <p className='text-fp-text text-sm font-medium'>Mesa {res.tableNumber}</p>
                    <p className='text-fp-subtle text-xs mt-0.5'>{fmtDateTime(res.reservedAt)}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[res.status] ?? STATUS_STYLE.COMPLETADA}`}
                  >
                    {res.status.charAt(0) + res.status.slice(1).toLowerCase()}
                  </span>
                  {res.status === 'ACTIVA' && (
                    <>
                      <button
                        onClick={() => setEditing(res)}
                        className='text-xs text-fp-subtle hover:text-fp-gold border border-fp-border hover:border-fp-gold/30 px-3 py-1.5 rounded-lg transition-colors'
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleCancel(res)}
                        disabled={cancelling === res._id}
                        className='text-xs text-fp-subtle hover:text-red-400 border border-fp-border hover:border-red-500/40 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50'
                      >
                        {cancelling === res._id ? '…' : 'Cancelar'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateReservationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={load}
        userId={user?.id}
      />

      <EditReservationModal
        reservation={editing}
        onClose={() => setEditing(null)}
        onUpdated={load}
      />
    </div>
  );
};
