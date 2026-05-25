import { useEffect, useState, useCallback } from 'react';
import { useRestaurantStore } from '../store/restaurantStore.js';
import {
  getTables,
  createTable,
  updateTable,
  activateTable,
  deactivateTable,
} from '../../../shared/apis/tables.js';
import {
  Modal,
  ModalActions,
  BtnPrimary,
  BtnSecondary,
} from '../../../shared/components/ui/Modal.jsx';
import { TableIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Constants ─────────────────────────────────────────────────────────────────
const LOCATIONS = ['Interior', 'Terraza', 'Barra', 'Jardín', 'VIP', 'Salón privado'];
const STATUSES = ['DISPONIBLE', 'OCUPADA', 'RESERVADA', 'FUERA_DE_SERVICIO'];

const STATUS_LABEL = {
  DISPONIBLE: 'Disponible',
  OCUPADA: 'Ocupada',
  RESERVADA: 'Reservada',
  FUERA_DE_SERVICIO: 'Fuera de servicio',
};
const STATUS_COLOR = {
  DISPONIBLE: 'text-fp-success  bg-fp-success-dim',
  OCUPADA: 'text-red-400     bg-red-400/10',
  RESERVADA: 'text-blue-400    bg-blue-400/10',
  FUERA_DE_SERVICIO: 'text-fp-muted    bg-fp-elevated',
};

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const Field = ({ label, children }) => (
  <div className='space-y-1.5'>
    <label className='text-fp-muted text-xs font-medium uppercase tracking-wide'>{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    className='w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm focus:outline-none focus:border-fp-gold/50 placeholder:text-fp-subtle'
    {...props}
  />
);

const Sel = ({ children, ...props }) => (
  <select
    className='w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm focus:outline-none focus:border-fp-gold/50'
    {...props}
  >
    {children}
  </select>
);

const EMPTY = { tableNumber: '', capacity: '', location: 'Interior', status: 'DISPONIBLE' };

// ── Form modal ────────────────────────────────────────────────────────────────
const TableFormModal = ({ isOpen, onClose, onSaved, restaurantId, editing }) => {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      editing
        ? {
            tableNumber: editing.tableNumber,
            capacity: editing.capacity,
            location: editing.location,
            status: editing.status,
          }
        : EMPTY
    );
    setError('');
  }, [isOpen, editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.tableNumber || !form.capacity) {
      setError('Número de mesa y capacidad son requeridos.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        tableNumber: Number(form.tableNumber),
        capacity: Number(form.capacity),
        location: form.location,
        status: form.status,
        restaurant: restaurantId,
      };
      editing ? await updateTable(editing._id, payload) : await createTable(payload);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al guardar la mesa');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Editar mesa' : 'Nueva mesa'}>
      <div className='space-y-4'>
        <div className='grid grid-cols-2 gap-4'>
          <Field label='N° de mesa'>
            <Input
              type='number'
              min='1'
              placeholder='1'
              value={form.tableNumber}
              onChange={(e) => set('tableNumber', e.target.value)}
            />
          </Field>
          <Field label='Capacidad'>
            <Input
              type='number'
              min='1'
              placeholder='4'
              value={form.capacity}
              onChange={(e) => set('capacity', e.target.value)}
            />
          </Field>
        </div>
        <Field label='Ubicación'>
          <Sel value={form.location} onChange={(e) => set('location', e.target.value)}>
            {LOCATIONS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </Sel>
        </Field>
        <Field label='Estado'>
          <Sel value={form.status} onChange={(e) => set('status', e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </Sel>
        </Field>
        {error && <p className='text-red-400 text-xs'>{error}</p>}
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={saving}>
          Cancelar
        </BtnSecondary>
        <BtnPrimary onClick={handleSubmit} loading={saving}>
          {editing ? 'Guardar cambios' : 'Crear mesa'}
        </BtnPrimary>
      </ModalActions>
    </Modal>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const TablesPage = () => {
  const { selectedRestaurant } = useRestaurantStore();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [busy, setBusy] = useState({});

  const fetchTables = useCallback(() => {
    if (!selectedRestaurant) return;
    setLoading(true);
    getTables({ restaurant: selectedRestaurant._id })
      .then((r) => setTables(r.data?.data ?? []))
      .catch(() => setTables([]))
      .finally(() => setLoading(false));
  }, [selectedRestaurant]);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleToggle = async (t) => {
    setBusy((p) => ({ ...p, [t._id]: true }));
    try {
      t.isAvailable ? await deactivateTable(t._id) : await activateTable(t._id);
      fetchTables();
    } finally {
      setBusy((p) => ({ ...p, [t._id]: false }));
    }
  };

  const filtered = filter === 'all' ? tables : tables.filter((t) => t.status === filter);

  if (!selectedRestaurant) {
    return (
      <div className='flex flex-col items-center justify-center py-20 text-fp-muted gap-3'>
        <TableIcon className='w-10 h-10 opacity-30' />
        <p className='text-sm'>Selecciona tu restaurante desde el Dashboard primero.</p>
      </div>
    );
  }

  return (
    <div className='space-y-6 animate-fadeUp'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='font-display text-2xl text-fp-text'>Gestión de Mesas</h1>
          <p className='text-fp-muted text-sm mt-0.5'>
            {selectedRestaurant.name} · {tables.length} mesa{tables.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className='px-4 py-2 bg-fp-gold text-fp-bg text-sm font-medium rounded-lg hover:bg-fp-gold-hover transition-colors'
        >
          + Nueva mesa
        </button>
      </div>

      {/* Status filter pills */}
      <div className='flex flex-wrap gap-2'>
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filter === s
                ? 'bg-fp-gold text-fp-bg'
                : 'bg-fp-elevated text-fp-muted hover:text-fp-text'
            }`}
          >
            {s === 'all' ? 'Todas' : STATUS_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className='h-40' />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-16 text-fp-muted gap-3'>
          <TableIcon className='w-10 h-10 opacity-30' />
          <p className='text-sm'>
            {filter !== 'all'
              ? `No hay mesas con estado "${STATUS_LABEL[filter]}"`
              : 'No hay mesas registradas'}
          </p>
        </div>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
          {filtered.map((t) => (
            <div
              key={t._id}
              className='bg-fp-surface border border-fp-border rounded-xl p-5 flex flex-col gap-4 hover:border-fp-gold/20 transition-colors'
            >
              <div className='flex items-start justify-between'>
                <div className='p-2.5 rounded-lg bg-fp-gold-dim'>
                  <TableIcon className='w-5 h-5 text-fp-gold' />
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLOR[t.status] ?? STATUS_COLOR.FUERA_DE_SERVICIO}`}
                >
                  {STATUS_LABEL[t.status] ?? t.status}
                </span>
              </div>
              <div>
                <p className='text-fp-text font-semibold text-lg'>Mesa {t.tableNumber}</p>
                <p className='text-fp-muted text-sm mt-0.5'>
                  {t.capacity} personas · {t.location}
                </p>
              </div>
              <div className='flex gap-2 mt-auto pt-2 border-t border-fp-border-subtle'>
                <button
                  onClick={() => {
                    setEditing(t);
                    setModalOpen(true);
                  }}
                  className='flex-1 text-xs py-1.5 rounded-lg border border-fp-border text-fp-muted hover:text-fp-text hover:border-fp-gold/30 transition-colors'
                >
                  Editar
                </button>
                <button
                  onClick={() => handleToggle(t)}
                  disabled={!!busy[t._id]}
                  className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                    t.isAvailable
                      ? 'border-red-400/30 text-red-400 hover:bg-red-400/10'
                      : 'border-fp-success/30 text-fp-success hover:bg-fp-success-dim'
                  }`}
                >
                  {busy[t._id] ? '...' : t.isAvailable ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <TableFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={fetchTables}
        restaurantId={selectedRestaurant._id}
        editing={editing}
      />
    </div>
  );
};
