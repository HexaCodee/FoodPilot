import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useRestaurantStore } from '../store/restaurantStore.js';
import {
  getInventory,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '../../../shared/apis/inventory.js';
import {
  Modal,
  ModalActions,
  BtnPrimary,
  BtnSecondary,
} from '../../../shared/components/ui/Modal.jsx';
import { BuildingIcon, ClipboardIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const CATEGORIES = [
  'BEBIDAS',
  'CARNES',
  'VERDURAS',
  'LACTEOS',
  'GRANOS',
  'CONDIMENTOS',
  'LIMPIEZA',
  'OTROS',
];
const CAT_LABEL = {
  BEBIDAS: 'Bebidas',
  CARNES: 'Carnes',
  VERDURAS: 'Verduras',
  LACTEOS: 'Lácteos',
  GRANOS: 'Granos',
  CONDIMENTOS: 'Condimentos',
  LIMPIEZA: 'Limpieza',
  OTROS: 'Otros',
};
const CAT_BADGE = {
  BEBIDAS: 'bg-blue-400/10 text-blue-400',
  CARNES: 'bg-red-400/10 text-red-400',
  VERDURAS: 'bg-green-400/10 text-green-400',
  LACTEOS: 'bg-yellow-400/10 text-yellow-400',
  GRANOS: 'bg-fp-gold-dim text-fp-gold',
  CONDIMENTOS: 'bg-orange-400/10 text-orange-400',
  LIMPIEZA: 'bg-purple-400/10 text-purple-400',
  OTROS: 'bg-fp-elevated text-fp-muted',
};

// ── No restaurant ─────────────────────────────────────────────────────────────
const NoRestaurant = () => (
  <div className='flex flex-col items-center justify-center py-20 text-center'>
    <div className='p-4 rounded-xl bg-fp-gold-dim mb-4'>
      <BuildingIcon className='w-8 h-8 text-fp-gold' />
    </div>
    <p className='text-fp-text font-medium text-lg'>Sin restaurante seleccionado</p>
    <p className='text-fp-subtle text-sm mt-2 max-w-xs'>
      Ve al dashboard y selecciona tu restaurante para gestionar el inventario.
    </p>
  </div>
);

// ── Form modal ────────────────────────────────────────────────────────────────
const emptyForm = { name: '', quantity: '', unit: '', minStock: '', category: 'BEBIDAS' };

const ItemModal = ({ isOpen, onClose, onSaved, restaurantId, editing }) => {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm(
        editing
          ? {
              name: editing.name,
              quantity: String(editing.quantity),
              unit: editing.unit,
              minStock: String(editing.minStock ?? 0),
              category: editing.category,
            }
          : emptyForm
      );
    }
  }, [isOpen, editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        quantity: Number(form.quantity),
        unit: form.unit.trim(),
        minStock: Number(form.minStock) || 0,
        category: form.category,
        restaurant: restaurantId,
      };
      if (editing) {
        await updateInventoryItem(editing._id, payload);
        toast.success('Insumo actualizado');
      } else {
        await createInventoryItem(payload);
        toast.success('Insumo creado');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.error ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const field =
    'w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm placeholder-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors';
  const label = 'block text-fp-subtle text-xs mb-1';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Editar insumo' : 'Nuevo insumo'}>
      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label className={label}>Nombre *</label>
          <input
            className={field}
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder='Ej. Harina de trigo'
            required
          />
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className={label}>Cantidad *</label>
            <input
              type='number'
              min='0'
              step='0.01'
              className={field}
              value={form.quantity}
              onChange={(e) => set('quantity', e.target.value)}
              required
            />
          </div>
          <div>
            <label className={label}>Unidad *</label>
            <input
              className={field}
              value={form.unit}
              onChange={(e) => set('unit', e.target.value)}
              placeholder='kg, L, pzas…'
              required
            />
          </div>
        </div>
        <div className='grid grid-cols-2 gap-3'>
          <div>
            <label className={label}>Stock mínimo</label>
            <input
              type='number'
              min='0'
              step='0.01'
              className={field}
              value={form.minStock}
              onChange={(e) => set('minStock', e.target.value)}
            />
          </div>
          <div>
            <label className={label}>Categoría *</label>
            <select
              className={field}
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              required
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CAT_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <ModalActions>
          <BtnSecondary onClick={onClose} disabled={saving}>
            Cancelar
          </BtnSecondary>
          <BtnPrimary type='submit' loading={saving}>
            {editing ? 'Guardar' : 'Crear'}
          </BtnPrimary>
        </ModalActions>
      </form>
    </Modal>
  );
};

// ── Delete modal ──────────────────────────────────────────────────────────────
const DeleteModal = ({ item, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);
  const confirm = async () => {
    setLoading(true);
    try {
      await deleteInventoryItem(item._id);
      toast.success('Insumo eliminado');
      onDeleted();
      onClose();
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal isOpen={!!item} onClose={onClose} title='Eliminar insumo'>
      <p className='text-fp-muted text-sm mb-2'>
        ¿Eliminar el insumo <strong className='text-fp-text'>{item?.name}</strong>?
      </p>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={loading}>
          Cancelar
        </BtnSecondary>
        <button
          onClick={confirm}
          disabled={loading}
          className='px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50'
        >
          {loading ? 'Eliminando…' : 'Eliminar'}
        </button>
      </ModalActions>
    </Modal>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const InventoryPage = () => {
  const { selectedRestaurant } = useRestaurantStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    if (!selectedRestaurant) return;
    setLoading(true);
    try {
      const r = await getInventory({ restaurant: selectedRestaurant._id, limit: 200 });
      setItems(r.data?.data ?? []);
    } catch {
      toast.error('Error al cargar inventario');
    } finally {
      setLoading(false);
    }
  }, [selectedRestaurant]);

  useEffect(() => {
    load();
  }, [load]);

  if (!selectedRestaurant) return <NoRestaurant />;

  const filtered = catFilter === 'all' ? items : items.filter((i) => i.category === catFilter);
  const lowStock = items.filter((i) => i.quantity <= (i.minStock ?? 0) && i.minStock > 0).length;

  return (
    <div className='space-y-5 animate-fadeUp'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='font-display text-2xl text-fp-text'>Inventario</h1>
          <p className='text-fp-muted text-sm mt-0.5'>
            {selectedRestaurant.name}
            {lowStock > 0 && (
              <span className='ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full'>
                {lowStock} bajo stock
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
          className='flex items-center gap-2 px-4 py-2 bg-fp-gold text-fp-bg text-sm font-medium rounded-lg hover:bg-fp-gold-hover transition-colors'
        >
          <ClipboardIcon className='w-4 h-4' />
          Nuevo insumo
        </button>
      </div>

      {/* Category filter */}
      <div className='flex gap-1 bg-fp-elevated p-1 rounded-lg w-fit flex-wrap'>
        {['all', ...CATEGORIES].map((c) => (
          <button
            key={c}
            onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              catFilter === c
                ? 'bg-fp-surface text-fp-text shadow-sm'
                : 'text-fp-muted hover:text-fp-text'
            }`}
          >
            {c === 'all' ? 'Todos' : CAT_LABEL[c]}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className='bg-fp-surface border border-fp-border rounded-xl overflow-hidden'>
        <div className='px-5 py-4 border-b border-fp-border flex items-center justify-between'>
          <h3 className='text-fp-text font-medium text-sm'>Insumos</h3>
          <span className='text-fp-subtle text-xs'>
            {loading ? '…' : `${filtered.length} registros`}
          </span>
        </div>

        {loading ? (
          <div className='p-5 space-y-3'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-10 w-full' />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className='text-fp-subtle text-sm text-center py-10'>
            Sin insumos{catFilter !== 'all' ? ' en esta categoría' : ''}
          </p>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-fp-border bg-fp-bg'>
                  {['Nombre', 'Cantidad', 'Unidad', 'Stock mín.', 'Categoría', 'Acciones'].map(
                    (h) => (
                      <th
                        key={h}
                        className='px-4 py-3 text-left text-xs text-fp-subtle uppercase tracking-wide font-medium'
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className='divide-y divide-fp-border-subtle'>
                {filtered.map((item) => {
                  const lowStockFlag = item.minStock > 0 && item.quantity <= item.minStock;
                  return (
                    <tr key={item._id} className='hover:bg-fp-elevated/50 transition-colors'>
                      <td className='px-4 py-3 text-fp-text font-medium'>{item.name}</td>
                      <td
                        className={`px-4 py-3 font-semibold ${lowStockFlag ? 'text-red-400' : 'text-fp-text'}`}
                      >
                        {item.quantity}
                      </td>
                      <td className='px-4 py-3 text-fp-muted'>{item.unit}</td>
                      <td className='px-4 py-3 text-fp-muted'>{item.minStock ?? 0}</td>
                      <td className='px-4 py-3'>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${CAT_BADGE[item.category] ?? CAT_BADGE.OTROS}`}
                        >
                          {CAT_LABEL[item.category] ?? item.category}
                        </span>
                      </td>
                      <td className='px-4 py-3'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => {
                              setEditing(item);
                              setModalOpen(true);
                            }}
                            className='text-xs text-fp-subtle hover:text-fp-gold border border-fp-border hover:border-fp-gold/40 px-2.5 py-1 rounded-lg transition-colors'
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => setDeleting(item)}
                            className='text-xs text-fp-subtle hover:text-red-400 border border-fp-border hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-colors'
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ItemModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        restaurantId={selectedRestaurant._id}
        editing={editing}
      />

      {deleting && (
        <DeleteModal item={deleting} onClose={() => setDeleting(null)} onDeleted={load} />
      )}
    </div>
  );
};
