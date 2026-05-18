import { useEffect, useState, useCallback } from 'react';
import { useRestaurantStore } from '../store/restaurantStore.js';
import { getMenus, createMenu, updateMenu, activateMenu, deactivateMenu } from '../../../shared/apis/menus.js';
import { Modal, ModalActions, BtnPrimary, BtnSecondary } from '../../../shared/components/ui/Modal.jsx';
import { UtensilsIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES = ['ENTRADA', 'PLATO_FUERTE', 'POSTRE', 'BEBIDA', 'DESAYUNO', 'COMBO'];
const CAT_LABEL  = { ENTRADA: 'Entrada', PLATO_FUERTE: 'Plato fuerte', POSTRE: 'Postre', BEBIDA: 'Bebida', DESAYUNO: 'Desayuno', COMBO: 'Combo' };
const CAT_COLOR  = {
  ENTRADA:      'text-emerald-400 bg-emerald-400/10',
  PLATO_FUERTE: 'text-fp-gold     bg-fp-gold-dim',
  POSTRE:       'text-pink-400    bg-pink-400/10',
  BEBIDA:       'text-blue-400    bg-blue-400/10',
  DESAYUNO:     'text-orange-400  bg-orange-400/10',
  COMBO:        'text-purple-400  bg-purple-400/10',
};

const Skeleton = ({ className = '' }) => <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />;

const Field = ({ label, children }) => (
  <div className="space-y-1.5">
    <label className="text-fp-muted text-xs font-medium uppercase tracking-wide">{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input className="w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm focus:outline-none focus:border-fp-gold/50 placeholder:text-fp-subtle" {...props} />
);

const Sel = ({ children, ...props }) => (
  <select className="w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm focus:outline-none focus:border-fp-gold/50" {...props}>
    {children}
  </select>
);

const Checkbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-2 cursor-pointer select-none">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 rounded accent-fp-gold" />
    <span className="text-fp-muted text-sm">{label}</span>
  </label>
);

const EMPTY = { name: '', description: '', price: '', category: 'PLATO_FUERTE', ingredients: '', preparationTime: '', isVegetarian: false, isVegan: false, isGlutenFree: false };

// ── Form modal ────────────────────────────────────────────────────────────────
const MenuFormModal = ({ isOpen, onClose, onSaved, restaurantId, editing }) => {
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setForm(editing ? {
      name: editing.name, description: editing.description ?? '',
      price: editing.price, category: editing.category,
      ingredients: (editing.ingredients ?? []).join(', '),
      preparationTime: editing.preparationTime ?? '',
      isVegetarian: editing.isVegetarian ?? false,
      isVegan: editing.isVegan ?? false,
      isGlutenFree: editing.isGlutenFree ?? false,
    } : EMPTY);
    setError('');
  }, [isOpen, editing]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.category) { setError('Nombre, precio y categoría son requeridos.'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        restaurant: restaurantId,
        ingredients: form.ingredients ? form.ingredients.split(',').map((i) => i.trim()).filter(Boolean) : [],
        preparationTime: form.preparationTime ? Number(form.preparationTime) : undefined,
        isVegetarian: form.isVegetarian,
        isVegan: form.isVegan,
        isGlutenFree: form.isGlutenFree,
      };
      editing ? await updateMenu(editing._id, payload) : await createMenu(payload);
      onSaved(); onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al guardar el ítem');
    } finally { setSaving(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editing ? 'Editar ítem' : 'Nuevo ítem del menú'} maxWidth="max-w-xl">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nombre">
            <Input placeholder="Filete a la plancha" value={form.name} onChange={(e) => set('name', e.target.value)} />
          </Field>
          <Field label="Precio ($)">
            <Input type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={(e) => set('price', e.target.value)} />
          </Field>
        </div>
        <Field label="Categoría">
          <Sel value={form.category} onChange={(e) => set('category', e.target.value)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{CAT_LABEL[c]}</option>)}
          </Sel>
        </Field>
        <Field label="Descripción (opcional)">
          <textarea
            rows={2}
            className="w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm focus:outline-none focus:border-fp-gold/50 placeholder:text-fp-subtle resize-none"
            placeholder="Descripción del plato..."
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Ingredientes (separados por coma)">
            <Input placeholder="Lechuga, tomate, aceite" value={form.ingredients} onChange={(e) => set('ingredients', e.target.value)} />
          </Field>
          <Field label="Tiempo de preparación (min)">
            <Input type="number" min="1" placeholder="15" value={form.preparationTime} onChange={(e) => set('preparationTime', e.target.value)} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-4 pt-1">
          <Checkbox label="Vegetariano" checked={form.isVegetarian} onChange={(v) => set('isVegetarian', v)} />
          <Checkbox label="Vegano"      checked={form.isVegan}      onChange={(v) => set('isVegan', v)} />
          <Checkbox label="Sin gluten"  checked={form.isGlutenFree} onChange={(v) => set('isGlutenFree', v)} />
        </div>
        {error && <p className="text-red-400 text-xs">{error}</p>}
      </div>
      <ModalActions>
        <BtnSecondary onClick={onClose} disabled={saving}>Cancelar</BtnSecondary>
        <BtnPrimary onClick={handleSubmit} loading={saving}>{editing ? 'Guardar cambios' : 'Crear ítem'}</BtnPrimary>
      </ModalActions>
    </Modal>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const MenuPage = () => {
  const { selectedRestaurant } = useRestaurantStore();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [catFilter, setCatFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [busy, setBusy]         = useState({});

  const fetchMenus = useCallback(() => {
    if (!selectedRestaurant) return;
    setLoading(true);
    getMenus({ restaurant: selectedRestaurant._id })
      .then((r) => setItems(r.data?.data ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [selectedRestaurant]);

  useEffect(() => { fetchMenus(); }, [fetchMenus]);

  const handleToggle = async (item) => {
    setBusy((p) => ({ ...p, [item._id]: true }));
    try {
      item.isAvailable ? await deactivateMenu(item._id) : await activateMenu(item._id);
      fetchMenus();
    } finally { setBusy((p) => ({ ...p, [item._id]: false })); }
  };

  const filtered = catFilter === 'all' ? items : items.filter((i) => i.category === catFilter);

  if (!selectedRestaurant) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-fp-muted gap-3">
        <UtensilsIcon className="w-10 h-10 opacity-30" />
        <p className="text-sm">Selecciona tu restaurante desde el Dashboard primero.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeUp">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-fp-text">Gestión del Menú</h1>
          <p className="text-fp-muted text-sm mt-0.5">{selectedRestaurant.name} · {items.length} ítem{items.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }}
          className="px-4 py-2 bg-fp-gold text-fp-bg text-sm font-medium rounded-lg hover:bg-fp-gold-hover transition-colors">
          + Agregar ítem
        </button>
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {['all', ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              catFilter === c ? 'bg-fp-gold text-fp-bg' : 'bg-fp-elevated text-fp-muted hover:text-fp-text'
            }`}>
            {c === 'all' ? 'Todos' : CAT_LABEL[c]}
          </button>
        ))}
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-fp-muted gap-3">
          <UtensilsIcon className="w-10 h-10 opacity-30" />
          <p className="text-sm">{catFilter !== 'all' ? `No hay ítems en "${CAT_LABEL[catFilter]}"` : 'No hay ítems en el menú'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item._id}
              className={`bg-fp-surface border rounded-xl p-5 flex flex-col gap-3 transition-colors ${
                item.isAvailable ? 'border-fp-border hover:border-fp-gold/20' : 'border-fp-border opacity-60'
              }`}>
              <div className="flex items-start justify-between gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CAT_COLOR[item.category] ?? 'text-fp-muted bg-fp-elevated'}`}>
                  {CAT_LABEL[item.category] ?? item.category}
                </span>
                <span className="text-fp-gold font-semibold text-sm">${Number(item.price).toFixed(2)}</span>
              </div>

              <div className="flex-1">
                <p className="text-fp-text font-medium text-sm">{item.name}</p>
                {item.description && <p className="text-fp-subtle text-xs mt-1 line-clamp-2">{item.description}</p>}
              </div>

              {/* Dietary tags */}
              <div className="flex flex-wrap gap-1">
                {item.isVegetarian && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400">Vegetariano</span>}
                {item.isVegan      && <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400">Vegano</span>}
                {item.isGlutenFree && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400">Sin gluten</span>}
                {item.preparationTime && <span className="text-xs px-2 py-0.5 rounded-full bg-fp-elevated text-fp-muted">{item.preparationTime} min</span>}
              </div>

              <div className="flex gap-2 pt-2 border-t border-fp-border-subtle">
                <button onClick={() => { setEditing(item); setModalOpen(true); }}
                  className="flex-1 text-xs py-1.5 rounded-lg border border-fp-border text-fp-muted hover:text-fp-text hover:border-fp-gold/30 transition-colors">
                  Editar
                </button>
                <button onClick={() => handleToggle(item)} disabled={!!busy[item._id]}
                  className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${
                    item.isAvailable
                      ? 'border-red-400/30 text-red-400 hover:bg-red-400/10'
                      : 'border-fp-success/30 text-fp-success hover:bg-fp-success-dim'
                  }`}>
                  {busy[item._id] ? '...' : item.isAvailable ? 'Ocultar' : 'Publicar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <MenuFormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchMenus}
        restaurantId={selectedRestaurant._id} editing={editing} />
    </div>
  );
};
