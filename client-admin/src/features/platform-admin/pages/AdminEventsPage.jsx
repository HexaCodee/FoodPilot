import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../../shared/apis/events.js';
import { getRestaurants } from '../../../shared/apis/restaurants.js';
import {
  Modal,
  ModalActions,
  BtnPrimary,
  BtnSecondary,
} from '../../../shared/components/ui/Modal.jsx';
import { CalendarIcon, CloseIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const STATUS_STYLES = {
  ACTIVO: 'bg-fp-success-dim text-fp-success',
  INACTIVO: 'bg-fp-elevated text-fp-muted',
  CANCELADO: 'bg-red-900/30 text-red-400',
};

const fmtDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const fmtPrice = (n) =>
  typeof n === 'number' ? `$${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}` : '—';

// ── Empty form ────────────────────────────────────────────────────────────────
const EMPTY = {
  restaurantId: '',
  restaurantName: '',
  restaurantCategory: '',
  name: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  maxCapacity: '',
  price: '',
  status: 'ACTIVO',
};

// ── Event card ────────────────────────────────────────────────────────────────
const EventCard = ({ event, onEdit, onDelete }) => (
  <div className='bg-fp-surface border border-fp-border rounded-xl p-5 flex flex-col gap-3 hover:border-fp-gold/25 transition-colors'>
    <div className='flex items-start justify-between gap-2'>
      <div className='flex-1 min-w-0'>
        <p className='text-fp-text font-medium truncate'>{event.name}</p>
        <p className='text-fp-subtle text-xs mt-0.5 truncate'>
          {event.restaurant?.name ?? '—'}
          {event.restaurant?.category ? ` · ${event.restaurant.category}` : ''}
        </p>
      </div>
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${STATUS_STYLES[event.status] ?? STATUS_STYLES.INACTIVO}`}
      >
        {event.status}
      </span>
    </div>

    {event.description && <p className='text-fp-muted text-xs line-clamp-2'>{event.description}</p>}

    <div className='grid grid-cols-2 gap-2 text-xs'>
      <div>
        <p className='text-fp-subtle uppercase tracking-wide mb-0.5'>Fecha</p>
        <p className='text-fp-text'>{fmtDate(event.date)}</p>
      </div>
      <div>
        <p className='text-fp-subtle uppercase tracking-wide mb-0.5'>Precio</p>
        <p className='text-fp-text'>{fmtPrice(event.price)}</p>
      </div>
      <div>
        <p className='text-fp-subtle uppercase tracking-wide mb-0.5'>Horario</p>
        <p className='text-fp-text'>
          {event.startTime || '—'}
          {event.endTime ? ` – ${event.endTime}` : ''}
        </p>
      </div>
      <div>
        <p className='text-fp-subtle uppercase tracking-wide mb-0.5'>Capacidad</p>
        <p className='text-fp-text'>
          {event.currentReservations ?? 0} / {event.maxCapacity}
        </p>
      </div>
    </div>

    <div className='flex gap-2 pt-1 border-t border-fp-border-subtle'>
      <button
        onClick={() => onEdit(event)}
        className='flex-1 py-1.5 text-xs rounded-lg border border-fp-border hover:border-fp-gold/40 hover:text-fp-gold text-fp-muted transition-colors'
      >
        Editar
      </button>
      <button
        onClick={() => onDelete(event)}
        className='flex-1 py-1.5 text-xs rounded-lg border border-red-900/40 hover:border-red-500/50 hover:text-red-400 text-fp-muted transition-colors'
      >
        Eliminar
      </button>
    </div>
  </div>
);

// ── Event form modal ──────────────────────────────────────────────────────────
const EventModal = ({ isOpen, onClose, initial, onSaved }) => {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    if (!isOpen) return;
    // Load restaurants for the picker
    getRestaurants({ isActive: 'all', limit: 100 })
      .then((r) => setRestaurants(r.data?.data ?? []))
      .catch(() => setRestaurants([]));

    if (initial) {
      setForm({
        restaurantId: initial.restaurant?.id?._id ?? initial.restaurant?.id ?? '',
        restaurantName: initial.restaurant?.name ?? '',
        restaurantCategory: initial.restaurant?.category ?? '',
        name: initial.name ?? '',
        description: initial.description ?? '',
        date: initial.date ? initial.date.slice(0, 10) : '',
        startTime: initial.startTime ?? '',
        endTime: initial.endTime ?? '',
        maxCapacity: initial.maxCapacity ?? '',
        price: initial.price ?? '',
        status: initial.status ?? 'ACTIVO',
      });
    } else {
      setForm(EMPTY);
    }
  }, [isOpen, initial]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pickRestaurant = (r) =>
    setForm((f) => ({
      ...f,
      restaurantId: r._id,
      restaurantName: r.name,
      restaurantCategory: r.category ?? '',
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.restaurantId || !form.restaurantName) {
      toast.error('Selecciona un restaurante antes de continuar');
      return;
    }
    const payload = {
      restaurant: {
        id: form.restaurantId,
        name: form.restaurantName,
        category: form.restaurantCategory,
      },
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      date: form.date,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      maxCapacity: Number(form.maxCapacity),
      price: Number(form.price),
      status: form.status,
    };

    setSaving(true);
    try {
      if (initial) {
        await updateEvent(initial._id, payload);
        toast.success('Evento actualizado');
      } else {
        await createEvent(payload);
        toast.success('Evento creado');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(
        err?.response?.data?.details ?? err?.response?.data?.error ?? 'Error al guardar el evento'
      );
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm placeholder-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors';
  const label = 'block text-fp-subtle text-xs mb-1';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initial ? 'Editar evento' : 'Nuevo evento'}
      maxWidth='max-w-2xl'
    >
      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Restaurant picker */}
        <div>
          <p className={label}>Restaurante *</p>
          {form.restaurantName ? (
            <div className='flex items-center justify-between bg-fp-bg border border-fp-gold/30 rounded-lg px-3 py-2'>
              <div>
                <p className='text-fp-text text-sm font-medium'>{form.restaurantName}</p>
                {form.restaurantCategory && (
                  <p className='text-fp-subtle text-xs'>{form.restaurantCategory}</p>
                )}
              </div>
              <button
                type='button'
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    restaurantId: '',
                    restaurantName: '',
                    restaurantCategory: '',
                  }))
                }
                className='text-fp-muted hover:text-fp-text'
              >
                <CloseIcon className='w-4 h-4' />
              </button>
            </div>
          ) : (
            <div className='max-h-40 overflow-y-auto border border-fp-border rounded-lg divide-y divide-fp-border-subtle'>
              {restaurants.length === 0 ? (
                <p className='text-fp-muted text-xs text-center py-4'>Cargando restaurantes…</p>
              ) : (
                restaurants.map((r) => (
                  <button
                    key={r._id}
                    type='button'
                    onClick={() => pickRestaurant(r)}
                    className='w-full flex items-center justify-between px-3 py-2.5 hover:bg-fp-elevated text-left transition-colors'
                  >
                    <p className='text-fp-text text-sm'>{r.name}</p>
                    <span className='text-fp-subtle text-xs'>{r.category}</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label className={label}>Nombre del evento *</label>
          <input
            className={field}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder='Ej. Noche de Jazz'
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className={label}>Descripción</label>
          <textarea
            className={field}
            rows={2}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder='Descripción del evento'
          />
        </div>

        {/* Date + Times */}
        <div className='grid grid-cols-3 gap-3'>
          <div>
            <label className={label}>Fecha *</label>
            <input
              type='date'
              className={field}
              value={form.date}
              onChange={(e) => set('date', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={label}>Hora inicio</label>
            <input
              type='time'
              className={field}
              value={form.startTime}
              onChange={(e) => set('startTime', e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Hora fin</label>
            <input
              type='time'
              className={field}
              value={form.endTime}
              onChange={(e) => set('endTime', e.target.value)}
            />
          </div>
        </div>

        {/* Capacity + Price + Status */}
        <div className='grid grid-cols-3 gap-3'>
          <div>
            <label className={label}>Capacidad máx. *</label>
            <input
              type='number'
              min='1'
              className={field}
              value={form.maxCapacity}
              onChange={(e) => set('maxCapacity', e.target.value)}
              placeholder='50'
              required
            />
          </div>
          <div>
            <label className={label}>Precio *</label>
            <input
              type='number'
              min='0'
              step='0.01'
              className={field}
              value={form.price}
              onChange={(e) => set('price', e.target.value)}
              placeholder='0.00'
              required
            />
          </div>
          <div>
            <label className={label}>Estado</label>
            <select
              className={field}
              value={form.status}
              onChange={(e) => set('status', e.target.value)}
            >
              <option value='ACTIVO'>Activo</option>
              <option value='INACTIVO'>Inactivo</option>
              <option value='CANCELADO'>Cancelado</option>
            </select>
          </div>
        </div>

        <ModalActions>
          <BtnSecondary onClick={onClose} disabled={saving}>
            Cancelar
          </BtnSecondary>
          <BtnPrimary type='submit' loading={saving}>
            {initial ? 'Guardar cambios' : 'Crear evento'}
          </BtnPrimary>
        </ModalActions>
      </form>
    </Modal>
  );
};

// ── Delete confirmation modal ─────────────────────────────────────────────────
const DeleteModal = ({ event, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try {
      await deleteEvent(event._id);
      toast.success('Evento eliminado');
      onDeleted();
      onClose();
    } catch {
      toast.error('Error al eliminar el evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={!!event} onClose={onClose} title='Eliminar evento'>
      <p className='text-fp-muted text-sm mb-1'>¿Estás seguro de que deseas eliminar el evento?</p>
      <p className='text-fp-text font-medium text-sm'>{event?.name}</p>
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
const STATUS_FILTERS = ['Todos', 'ACTIVO', 'INACTIVO', 'CANCELADO'];

export const AdminEventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getEvents();
      setEvents(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error('Error al cargar eventos');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (ev) => {
    setEditing(ev);
    setModalOpen(true);
  };

  const filtered = filter === 'Todos' ? events : events.filter((e) => e.status === filter);

  const counts = STATUS_FILTERS.reduce((acc, s) => {
    acc[s] = s === 'Todos' ? events.length : events.filter((e) => e.status === s).length;
    return acc;
  }, {});

  return (
    <div className='space-y-6 animate-fadeUp'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='font-display text-2xl text-fp-text'>Eventos</h1>
          <p className='text-fp-muted text-sm mt-0.5'>
            {loading
              ? 'Cargando…'
              : `${events.length} evento${events.length !== 1 ? 's' : ''} registrado${events.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className='flex items-center gap-2 px-4 py-2 bg-fp-gold text-fp-bg text-sm font-medium rounded-lg hover:bg-fp-gold-hover transition-colors'
        >
          <CalendarIcon className='w-4 h-4' />
          Nuevo evento
        </button>
      </div>

      {/* Filter pills */}
      <div className='flex flex-wrap gap-2'>
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === s
                ? 'bg-fp-gold text-fp-bg border-fp-gold'
                : 'border-fp-border text-fp-muted hover:border-fp-gold/40 hover:text-fp-text'
            }`}
          >
            {s === 'Todos' ? 'Todos' : s.charAt(0) + s.slice(1).toLowerCase()} ({counts[s]})
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-56 w-full' />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 text-center'>
          <CalendarIcon className='w-10 h-10 text-fp-muted mb-3' />
          <p className='text-fp-text font-medium'>Sin eventos</p>
          <p className='text-fp-subtle text-sm mt-1'>
            {filter !== 'Todos'
              ? `No hay eventos con estado "${filter}"`
              : 'Crea el primer evento con el botón de arriba'}
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
          {filtered.map((ev) => (
            <EventCard key={ev._id} event={ev} onEdit={openEdit} onDelete={setDeleting} />
          ))}
        </div>
      )}

      {/* Modals */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        onSaved={load}
      />
      {deleting && (
        <DeleteModal event={deleting} onClose={() => setDeleting(null)} onDeleted={load} />
      )}
    </div>
  );
};
