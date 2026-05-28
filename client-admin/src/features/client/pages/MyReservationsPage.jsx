import { useState, useEffect, useCallback, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore.js';
import {
  getReservations,
  createReservation,
  cancelReservation,
  updateReservation,
} from '../../../shared/apis/reservations.js';
import { getRestaurants } from '../../../shared/apis/restaurants.js';
import { getTables, getTableById } from '../../../shared/apis/tables.js';
import {
  Modal,
  ModalActions,
  BtnPrimary,
  BtnSecondary,
} from '../../../shared/components/ui/Modal.jsx';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '../../../shared/components/ui/Icons.jsx';

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
  CANCELADA_ADMIN: 'bg-amber-900/30 text-amber-400',
  COMPLETADA: 'bg-fp-elevated   text-fp-muted',
};

const TABS = ['Todas', 'ACTIVA', 'CANCELADA', 'COMPLETADA'];
const DOW = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'];

const dayKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

// ── Availability Calendar ─────────────────────────────────────────────────────
const AvailabilityCalendar = ({ takenSlots, selected, onSelect, table }) => {
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [activeDay, setActiveDay] = useState(null);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // Use table availability hours if provided, fallback to 8-22
  const fromH = table?.availableFrom ? parseInt(table.availableFrom) : 8;
  const toH = table?.availableTo ? parseInt(table.availableTo) : 22;
  const HOURS = useMemo(
    () => Array.from({ length: toH - fromH + 1 }, (_, i) => i + fromH),
    [fromH, toH]
  );

  const firstDow = (month.getDay() + 6) % 7; // Mon = 0
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];

  const getDayState = (date) => {
    if (date < today) return 'past';
    // Check if this day of the week is in the table's available days
    const availableDays = table?.availableDays ?? [0, 1, 2, 3, 4, 5, 6];
    if (!availableDays.includes(date.getDay())) return 'closed';
    const dk = dayKey(date);
    const taken = HOURS.filter((h) => takenSlots.has(`${dk}-${h}`)).length;
    if (taken >= HOURS.length) return 'full';
    if (taken > 0) return 'partial';
    return 'free';
  };

  return (
    <div className='space-y-3'>
      {/* Month nav */}
      <div className='flex items-center justify-between'>
        <button
          type='button'
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          className='p-1 text-fp-muted hover:text-fp-text transition-colors rounded-lg hover:bg-fp-elevated'
        >
          <ChevronLeftIcon className='w-4 h-4' />
        </button>
        <span className='text-fp-text text-sm font-medium capitalize'>
          {month.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
        </span>
        <button
          type='button'
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          className='p-1 text-fp-muted hover:text-fp-text transition-colors rounded-lg hover:bg-fp-elevated'
        >
          <ChevronRightIcon className='w-4 h-4' />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className='grid grid-cols-7 text-center'>
        {DOW.map((d) => (
          <span key={d} className='text-fp-subtle text-xs py-1 font-medium'>
            {d}
          </span>
        ))}
      </div>

      {/* Day cells */}
      <div className='grid grid-cols-7 gap-1'>
        {cells.map((date, i) => {
          if (!date) return <div key={`e${i}`} />;
          const state = getDayState(date);
          const isActive = activeDay && dayKey(activeDay) === dayKey(date);
          const isDisabled = state === 'past' || state === 'full' || state === 'closed';

          return (
            <button
              key={i}
              type='button'
              disabled={isDisabled}
              onClick={() => setActiveDay(date)}
              className={`h-8 w-full rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-fp-gold text-fp-bg'
                  : state === 'past' || state === 'closed'
                    ? 'text-fp-subtle opacity-30 cursor-not-allowed'
                    : state === 'full'
                      ? 'bg-red-500/15 text-red-400 cursor-not-allowed'
                      : state === 'partial'
                        ? 'bg-amber-400/15 text-amber-400 hover:bg-amber-400/25 cursor-pointer'
                        : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer'
              }`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className='flex items-center gap-4 text-xs text-fp-subtle pt-1'>
        {[
          { color: 'bg-emerald-500/20', label: 'Disponible' },
          { color: 'bg-amber-400/20', label: 'Parcial' },
          { color: 'bg-red-500/20', label: 'Completo' },
          { color: 'bg-fp-elevated opacity-50', label: 'Cerrado' },
        ].map(({ color, label }) => (
          <span key={label} className='flex items-center gap-1.5'>
            <span className={`w-3 h-3 rounded ${color} inline-block flex-shrink-0`} />
            {label}
          </span>
        ))}
      </div>

      {/* Time slots for the active day */}
      {activeDay && (
        <div className='border-t border-fp-border pt-3'>
          <p className='text-fp-muted text-xs mb-2.5 capitalize font-medium'>
            {activeDay.toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <div className='grid grid-cols-5 gap-1.5'>
            {HOURS.map((h) => {
              const dk = dayKey(activeDay);
              const taken = takenSlots.has(`${dk}-${h}`);
              const slot = new Date(activeDay);
              slot.setHours(h, 0, 0, 0);
              const isPast = slot <= new Date();
              const isDisabled = taken || isPast;
              const isSel = selected && selected.getTime() === slot.getTime();
              return (
                <button
                  key={h}
                  type='button'
                  disabled={isDisabled}
                  onClick={() => !isDisabled && onSelect(slot)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    isSel
                      ? 'bg-fp-gold text-fp-bg'
                      : taken
                        ? 'bg-red-500/10 text-red-400 cursor-not-allowed opacity-60 line-through'
                        : isPast
                          ? 'bg-fp-elevated text-fp-subtle cursor-not-allowed opacity-40 line-through'
                          : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 cursor-pointer'
                  }`}
                >
                  {String(h).padStart(2, '0')}:00
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Create reservation modal ──────────────────────────────────────────────────
const CreateReservationModal = ({ isOpen, onClose, onCreated, userId }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [tables, setTables] = useState([]);
  const [tableId, setTableId] = useState('');
  const [existingReservations, setExistingReservations] = useState([]);
  const [reservedAt, setReservedAt] = useState(null);
  const [loadingRest, setLoadingRest] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset & load restaurants on open
  useEffect(() => {
    if (!isOpen) return;
    setRestaurantId('');
    setTableId('');
    setReservedAt(null);
    setExistingReservations([]);

    setLoadingRest(true);
    getRestaurants({ isActive: true, limit: 100 })
      .then((r) => setRestaurants(r.data?.data ?? []))
      .catch(() => toast.error('No se pudieron cargar los restaurantes'))
      .finally(() => setLoadingRest(false));
  }, [isOpen]);

  // Load tables when restaurant changes
  useEffect(() => {
    if (!restaurantId) {
      setTables([]);
      setTableId('');
      return;
    }
    setLoadingTables(true);
    setTableId('');
    setReservedAt(null);
    getTables({ restaurant: restaurantId, limit: 100 })
      .then((r) => {
        const all = r.data?.data ?? [];
        // Only offer tables that are DISPONIBLE or active
        setTables(all.filter((t) => t.status === 'DISPONIBLE' || t.isAvailable));
      })
      .catch(() => toast.error('No se pudieron cargar las mesas'))
      .finally(() => setLoadingTables(false));
  }, [restaurantId]);

  // Load existing reservations when table changes (to build taken-slots map)
  useEffect(() => {
    if (!tableId) {
      setExistingReservations([]);
      setReservedAt(null);
      return;
    }
    setLoadingSlots(true);
    setReservedAt(null);
    getReservations({ tableId, limit: 500 })
      .then((r) => {
        const data = Array.isArray(r.data) ? r.data : [];
        setExistingReservations(data.filter((rv) => rv.status === 'ACTIVA'));
      })
      .catch(() => setExistingReservations([]))
      .finally(() => setLoadingSlots(false));
  }, [tableId]);

  // Build Set of taken slot keys ('YYYY-MM-DD-H')
  const takenSlots = useMemo(() => {
    const s = new Set();
    existingReservations.forEach((rv) => {
      const d = new Date(rv.reservedAt);
      s.add(`${dayKey(d)}-${d.getHours()}`);
    });
    return s;
  }, [existingReservations]);

  const selectedTable = tables.find((t) => t._id === tableId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantId) return toast.error('Selecciona un restaurante');
    if (!tableId) return toast.error('Selecciona una mesa');
    if (!reservedAt) return toast.error('Selecciona fecha y hora en el calendario');

    setSaving(true);
    try {
      await createReservation({
        tableNumber: selectedTable?.tableNumber,
        tableId,
        restaurantId,
        reservedAt: reservedAt.toISOString(),
        userId,
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

  const fieldCls =
    'w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm focus:outline-none focus:border-fp-gold/50 transition-colors';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Nueva reserva' maxWidth='max-w-xl'>
      <form onSubmit={handleSubmit} className='space-y-5'>
        {/* Restaurante */}
        <div>
          <label className='block text-fp-subtle text-xs mb-1'>Restaurante *</label>
          <select
            className={fieldCls}
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            required
            disabled={loadingRest}
          >
            <option value=''>
              {loadingRest ? 'Cargando…' : '— Selecciona un restaurante —'}
            </option>
            {restaurants.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mesa */}
        {restaurantId && (
          <div>
            <label className='block text-fp-subtle text-xs mb-1'>Mesa *</label>
            {loadingTables ? (
              <Skeleton className='h-10 w-full' />
            ) : tables.length === 0 ? (
              <p className='text-fp-subtle text-sm py-2'>
                Este restaurante no tiene mesas disponibles.
              </p>
            ) : (
              <select
                className={fieldCls}
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                required
              >
                <option value=''>— Selecciona una mesa —</option>
                {tables.map((t) => (
                  <option key={t._id} value={t._id}>
                    Mesa {t.tableNumber} · {t.capacity} personas · {t.location}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Calendario de disponibilidad */}
        {tableId && (
          <div>
            <label className='block text-fp-subtle text-xs mb-2'>Fecha y hora *</label>
            {loadingSlots ? (
              <div className='space-y-2'>
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-36 w-full' />
              </div>
            ) : (
              <div className='bg-fp-bg border border-fp-border rounded-xl p-4'>
                <AvailabilityCalendar
                  takenSlots={takenSlots}
                  selected={reservedAt}
                  onSelect={setReservedAt}
                  table={selectedTable}
                />
              </div>
            )}

            {reservedAt && (
              <div className='mt-2 flex items-center gap-2 text-fp-success text-xs bg-fp-success-dim px-3 py-2 rounded-lg'>
                <CalendarIcon className='w-3.5 h-3.5 flex-shrink-0' />
                Seleccionado:{' '}
                <span className='font-medium'>
                  {reservedAt.toLocaleString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        <ModalActions>
          <BtnSecondary onClick={onClose} disabled={saving}>
            Cancelar
          </BtnSecondary>
          <BtnPrimary type='submit' loading={saving} disabled={!reservedAt}>
            Reservar
          </BtnPrimary>
        </ModalActions>
      </form>
    </Modal>
  );
};

// ── Edit reservation modal ────────────────────────────────────────────────────
const EditReservationModal = ({ reservation, onClose, onUpdated }) => {
  const [table, setTable] = useState(null);
  const [existingReservations, setExistingReservations] = useState([]);
  const [reservedAt, setReservedAt] = useState(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!reservation) return;
    setReservedAt(null);
    setTable(null);
    setExistingReservations([]);

    // Strategy 1: direct tableId lookup (new reservations)
    // Strategy 2: fetch tables by restaurantId and match by tableNumber (legacy)
    const loadTable = async () => {
      setLoadingTable(true);
      try {
        let tbl = null;

        if (reservation.tableId) {
          const r = await getTableById(reservation.tableId);
          tbl = r.data?.data ?? null;
        } else if (reservation.restaurantId) {
          const r = await getTables({ restaurant: reservation.restaurantId, limit: 100, isAvailable: 'all' });
          const all = r.data?.data ?? [];
          tbl = all.find((t) => String(t.tableNumber) === String(reservation.tableNumber)) ?? null;
        }

        setTable(tbl);

        // Load existing reservations for this table to build taken-slots
        if (tbl) {
          // Try by tableId first; if empty, fall back to restaurantId + match by tableNumber
          const rId = reservation.tableId || tbl._id;
          const r2 = await getReservations({ tableId: rId, limit: 500 });
          let existing = (Array.isArray(r2.data) ? r2.data : []).filter(
            (rv) => rv.status === 'ACTIVA' && rv._id !== reservation._id
          );

          // Legacy reservations won't have tableId stored — try fetching by restaurantId
          if (existing.length === 0 && reservation.restaurantId) {
            const r3 = await getReservations({ restaurantId: reservation.restaurantId, limit: 500 });
            existing = (Array.isArray(r3.data) ? r3.data : []).filter(
              (rv) =>
                rv.status === 'ACTIVA' &&
                rv._id !== reservation._id &&
                String(rv.tableNumber) === String(reservation.tableNumber)
            );
          }

          setExistingReservations(existing);
        }
      } catch {
        setTable(null);
        setExistingReservations([]);
      } finally {
        setLoadingTable(false);
      }
    };

    loadTable();
  }, [reservation]);

  const takenSlots = useMemo(() => {
    const s = new Set();
    existingReservations.forEach((rv) => {
      const d = new Date(rv.reservedAt);
      s.add(`${dayKey(d)}-${d.getHours()}`);
    });
    return s;
  }, [existingReservations]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reservedAt) return toast.error('Selecciona una nueva fecha y hora');
    setSaving(true);
    try {
      await updateReservation(reservation._id, {
        tableNumber: reservation.tableNumber,
        reservedAt: reservedAt.toISOString(),
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

  return (
    <Modal isOpen={!!reservation} onClose={onClose} title='Editar reserva' maxWidth='max-w-xl'>
      {reservation && (
        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Mesa info */}
          <div className='bg-fp-bg border border-fp-border rounded-lg px-4 py-3 text-sm text-fp-muted'>
            Mesa {reservation.tableNumber}
            {table && (
              <span className='ml-2 text-fp-subtle'>
                · {table.capacity} personas · {table.location}
              </span>
            )}
          </div>

          {/* Calendar or fallback */}
          <div>
            <label className='block text-fp-subtle text-xs mb-2'>Nueva fecha y hora *</label>
            {loadingTable ? (
              <div className='space-y-2'>
                <Skeleton className='h-8 w-full' />
                <Skeleton className='h-36 w-full' />
              </div>
            ) : (
              <div className='bg-fp-bg border border-fp-border rounded-xl p-4'>
                <AvailabilityCalendar
                  takenSlots={takenSlots}
                  selected={reservedAt}
                  onSelect={setReservedAt}
                  table={table}
                />
              </div>
            )}

            {reservedAt && (
              <div className='mt-2 flex items-center gap-2 text-fp-success text-xs bg-fp-success-dim px-3 py-2 rounded-lg'>
                <CalendarIcon className='w-3.5 h-3.5 flex-shrink-0' />
                Seleccionado:{' '}
                <span className='font-medium'>
                  {reservedAt.toLocaleString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
          </div>

          <ModalActions>
            <BtnSecondary onClick={onClose} disabled={saving}>
              Cancelar
            </BtnSecondary>
            <BtnPrimary type='submit' loading={saving} disabled={!reservedAt}>
              Guardar cambios
            </BtnPrimary>
          </ModalActions>
        </form>
      )}
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
  const NOTIFIED_KEY = `fp_cancelled_notified_${user?.id}`;

  const getNotifiedIds = () => {
    try {
      return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) ?? '[]'));
    } catch {
      return new Set();
    }
  };

  const markAsNotified = (ids) => {
    const existing = getNotifiedIds();
    ids.forEach((id) => existing.add(id));
    localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...existing]));
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getReservations({ userId: user?.id });
      const data = Array.isArray(r.data) ? r.data : [];
      setReservations(data);

      // Show a toast only for admin-cancelled reservations not yet notified
      const alreadyNotified = getNotifiedIds();
      const newAdminCancelled = data.filter(
        (rv) => rv.cancelledByAdmin && !alreadyNotified.has(rv._id)
      );
      if (newAdminCancelled.length > 0) {
        markAsNotified(newAdminCancelled.map((rv) => rv._id));
        toast(
          newAdminCancelled.length === 1
            ? 'Una reserva fue cancelada por el restaurante.'
            : `${newAdminCancelled.length} reservas fueron canceladas por el restaurante.`,
          { icon: '⚠️', duration: 6000 }
        );
      }
    } catch {
      toast.error('Error al cargar reservas');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                    <p className='text-fp-text text-sm font-medium'>
                      Mesa {res.tableNumber}
                    </p>
                    <p className='text-fp-subtle text-xs mt-0.5'>{fmtDateTime(res.reservedAt)}</p>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      res.status === 'CANCELADA' && res.cancelledByAdmin
                        ? STATUS_STYLE.CANCELADA_ADMIN
                        : (STATUS_STYLE[res.status] ?? STATUS_STYLE.COMPLETADA)
                    }`}
                  >
                    {res.status === 'CANCELADA' && res.cancelledByAdmin
                      ? 'Cancelada por restaurante'
                      : res.status.charAt(0) + res.status.slice(1).toLowerCase()}
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
