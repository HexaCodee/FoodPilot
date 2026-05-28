import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore.js';
import { getOrders, createOrder, cancelOrder } from '../../../shared/apis/orders.js';
import { getRestaurants } from '../../../shared/apis/restaurants.js';
import { getMenus } from '../../../shared/apis/menus.js';
import {
  Modal,
  ModalActions,
  BtnPrimary,
  BtnSecondary,
} from '../../../shared/components/ui/Modal.jsx';
import { BagIcon, PlusIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—';

const fmtMoney = (n) =>
  typeof n === 'number' ? `$${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}` : '—';

const STATUS_LABEL = {
  PENDIENTE: 'Pendiente',
  ENVIADO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};
const STATUS_STYLE = {
  PENDIENTE: 'bg-fp-gold-dim    text-fp-gold',
  ENVIADO: 'bg-blue-400/10   text-blue-400',
  ENTREGADO: 'bg-fp-success-dim text-fp-success',
  CANCELADO: 'bg-red-900/30    text-red-400',
};

const TABS = ['Todos', 'PENDIENTE', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

const EMPTY_ITEM = { productId: '', name: '', price: 0, quantity: 1 };

const field =
  'w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm placeholder-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors';

// ── Create order modal ────────────────────────────────────────────────────────
const CreateOrderModal = ({ isOpen, onClose, onCreated, user }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [menuItems, setMenuItems] = useState([]);
  const [loadingRest, setLoadingRest] = useState(false);
  const [loadingMenu, setLoadingMenu] = useState(false);

  const [items, setItems] = useState([{ ...EMPTY_ITEM }]);
  const [phone, setPhone] = useState('');
  const [isDelivery, setIsDelivery] = useState(false);
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  // Load restaurants once on open
  useEffect(() => {
    if (!isOpen) return;
    setRestaurantId('');
    setMenuItems([]);
    setItems([{ ...EMPTY_ITEM }]);
    setPhone('');
    setIsDelivery(false);
    setAddress('');

    setLoadingRest(true);
    getRestaurants({ isActive: true, limit: 100 })
      .then((r) => setRestaurants(r.data?.data ?? []))
      .catch(() => toast.error('No se pudieron cargar los restaurantes'))
      .finally(() => setLoadingRest(false));
  }, [isOpen]);

  // Load menu when restaurant changes
  useEffect(() => {
    if (!restaurantId) {
      setMenuItems([]);
      setItems([{ ...EMPTY_ITEM }]);
      return;
    }
    setLoadingMenu(true);
    setItems([{ ...EMPTY_ITEM }]);
    getMenus({ restaurant: restaurantId, isAvailable: true, limit: 200 })
      .then((r) => setMenuItems(r.data?.data ?? []))
      .catch(() => toast.error('No se pudo cargar el menú del restaurante'))
      .finally(() => setLoadingMenu(false));
  }, [restaurantId]);

  const total = items.reduce((sum, it) => sum + it.price * Math.max(1, Number(it.quantity)), 0);

  const updateItem = (idx, field, value) => {
    setItems((prev) => {
      const next = [...prev];
      if (field === 'productId') {
        const found = menuItems.find((m) => m._id === value);
        next[idx] = {
          ...next[idx],
          productId: value,
          name: found?.name ?? '',
          price: found?.price ?? 0,
        };
      } else {
        next[idx] = { ...next[idx], [field]: value };
      }
      return next;
    });
  };

  const addItem = () => setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  const removeItem = (idx) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!restaurantId) return toast.error('Selecciona un restaurante');
    if (items.some((it) => !it.productId)) return toast.error('Selecciona un producto en cada fila');
    if (!phone.trim()) return toast.error('El número de teléfono es requerido');
    if ((phone.replace(/\D/g, '').length) < 7)
      return toast.error('Ingresa un número de teléfono válido (mínimo 7 dígitos)');
    if (isDelivery && !address.trim())
      return toast.error('La dirección es requerida para pedidos a domicilio');

    setSaving(true);
    try {
      const resolvedItems = items.map((it) => ({
        productId: it.productId,
        name: it.name,
        price: it.price,
        quantity: Number(it.quantity),
      }));

      await createOrder({
        customerName: user?.username ?? 'Cliente',
        restaurantId,
        items: resolvedItems,
        // Campos de compatibilidad con el schema existente
        product: resolvedItems.map((it) => it.name).join(', '),
        quantity: resolvedItems.reduce((s, it) => s + it.quantity, 0),
        price: total,
        phone: phone.trim(),
        isDelivery,
        address: isDelivery ? address.trim() : undefined,
        userId: user?.id,
      });

      toast.success('Pedido creado');
      onCreated();
      onClose();
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      const msg =
        Array.isArray(apiErrors) && apiErrors.length > 0
          ? apiErrors[0].msg
          : (err?.response?.data?.message ?? 'Error al crear el pedido');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const selectedRestName = restaurants.find((r) => r._id === restaurantId)?.name ?? '';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title='Nuevo pedido' maxWidth='max-w-2xl'>
      <form onSubmit={handleSubmit} className='space-y-5'>
        {/* Cliente (solo lectura) */}
        <div>
          <label className='block text-fp-subtle text-xs mb-1'>Cliente</label>
          <input
            className={`${field} opacity-60 cursor-not-allowed`}
            value={user?.username ?? '—'}
            readOnly
          />
        </div>

        {/* Restaurante */}
        <div>
          <label className='block text-fp-subtle text-xs mb-1'>Restaurante *</label>
          <select
            className={field}
            value={restaurantId}
            onChange={(e) => setRestaurantId(e.target.value)}
            required
            disabled={loadingRest}
          >
            <option value=''>
              {loadingRest ? 'Cargando restaurantes…' : '— Selecciona un restaurante —'}
            </option>
            {restaurants.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Productos */}
        <div>
          <label className='block text-fp-subtle text-xs mb-2'>Productos *</label>

          {loadingMenu ? (
            <div className='space-y-2'>
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-10 w-full' />
            </div>
          ) : (
            <div className='space-y-2'>
              {items.map((it, idx) => (
                <div key={idx} className='flex items-center gap-2'>
                  {/* Product selector */}
                  <select
                    className={`${field} flex-1`}
                    value={it.productId}
                    onChange={(e) => updateItem(idx, 'productId', e.target.value)}
                    required
                    disabled={!restaurantId}
                  >
                    <option value=''>
                      {!restaurantId
                        ? 'Primero selecciona un restaurante'
                        : menuItems.length === 0
                          ? 'Sin productos disponibles'
                          : '— Producto —'}
                    </option>
                    {menuItems.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name} — {fmtMoney(m.price)}
                      </option>
                    ))}
                  </select>

                  {/* Quantity */}
                  <input
                    type='number'
                    min='1'
                    className='w-20 bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm text-center focus:outline-none focus:border-fp-gold/50 transition-colors'
                    value={it.quantity}
                    onChange={(e) => updateItem(idx, 'quantity', Math.max(1, Number(e.target.value)))}
                    required
                  />

                  {/* Subtotal */}
                  <span className='w-24 text-right text-fp-muted text-sm flex-shrink-0'>
                    {fmtMoney(it.price * Math.max(1, Number(it.quantity)))}
                  </span>

                  {/* Remove row */}
                  {items.length > 1 && (
                    <button
                      type='button'
                      onClick={() => removeItem(idx)}
                      className='text-fp-subtle hover:text-red-400 text-lg leading-none flex-shrink-0 transition-colors'
                      title='Quitar producto'
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Add product row */}
          {restaurantId && menuItems.length > 0 && (
            <button
              type='button'
              onClick={addItem}
              className='mt-2 flex items-center gap-1.5 text-xs text-fp-gold hover:text-fp-gold-hover transition-colors'
            >
              <PlusIcon className='w-3.5 h-3.5' />
              Agregar otro producto
            </button>
          )}

          {/* Total */}
          {items.some((it) => it.productId) && (
            <div className='flex justify-end mt-3 pt-3 border-t border-fp-border-subtle'>
              <span className='text-fp-muted text-sm mr-3'>Total</span>
              <span className='text-fp-text font-semibold'>{fmtMoney(total)}</span>
            </div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className='block text-fp-subtle text-xs mb-1'>Teléfono de contacto *</label>
          <input
            className={field}
            type='tel'
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d+\-\s().]/g, ''))}
            placeholder='Ej. +504 9999-9999'
            maxLength={20}
            required
          />
        </div>

        {/* Pickup vs Delivery */}
        <div className='space-y-3'>
          <label className='flex items-center gap-3 cursor-pointer group'>
            <div
              onClick={() => setIsDelivery((v) => !v)}
              className={`w-11 h-6 rounded-full relative transition-colors duration-200 flex-shrink-0 ${
                isDelivery ? 'bg-fp-gold' : 'bg-fp-elevated border border-fp-border'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                  isDelivery ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </div>
            <span className='text-fp-text text-sm select-none'>Pedido a domicilio</span>
            {!isDelivery && (
              <span className='text-fp-subtle text-xs'>(recoger en restaurante)</span>
            )}
          </label>

          {/* Address — only shown for delivery */}
          {isDelivery && (
            <div>
              <label className='block text-fp-subtle text-xs mb-1'>Dirección de entrega *</label>
              <input
                className={field}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder='Calle, colonia, referencias…'
                required={isDelivery}
              />
            </div>
          )}
        </div>

        <ModalActions>
          <BtnSecondary onClick={onClose} disabled={saving}>
            Cancelar
          </BtnSecondary>
          <BtnPrimary type='submit' loading={saving}>
            Crear pedido
          </BtnPrimary>
        </ModalActions>
      </form>
    </Modal>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const MyOrdersPage = () => {
  const user = useAuthStore((s) => s.user);

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getOrders({ userId: user?.id });
      setOrders(Array.isArray(r.data) ? r.data : []);
    } catch {
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancel = async (order) => {
    setCancelling(order._id);
    try {
      await cancelOrder(order._id);
      toast.success('Pedido cancelado');
      load();
    } catch {
      toast.error('Error al cancelar el pedido');
    } finally {
      setCancelling(null);
    }
  };

  const filtered = tab === 'Todos' ? orders : orders.filter((o) => o.status === tab);

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'Todos' ? orders.length : orders.filter((o) => o.status === t).length;
    return acc;
  }, {});

  return (
    <div className='space-y-6 animate-fadeUp'>
      {/* Header */}
      <div className='flex items-start justify-between gap-4'>
        <div>
          <h1 className='font-display text-2xl text-fp-text'>Mis Pedidos</h1>
          <p className='text-fp-muted text-sm mt-0.5'>
            {loading
              ? 'Cargando…'
              : `${orders.length} pedido${orders.length !== 1 ? 's' : ''} registrado${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className='flex items-center gap-2 px-4 py-2 bg-fp-gold text-fp-bg text-sm font-medium rounded-lg hover:bg-fp-gold-hover transition-colors'
        >
          <BagIcon className='w-4 h-4' />
          Nuevo pedido
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
            {t === 'Todos' ? 'Todos' : STATUS_LABEL[t]} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className='bg-fp-surface border border-fp-border rounded-xl overflow-hidden'>
        {loading ? (
          <div className='p-5 space-y-3'>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <BagIcon className='w-10 h-10 text-fp-muted mb-3' />
            <p className='text-fp-text font-medium'>Sin pedidos</p>
            <p className='text-fp-subtle text-sm mt-1'>
              {tab !== 'Todos'
                ? `No hay pedidos con estado "${STATUS_LABEL[tab]}"`
                : 'Crea tu primer pedido con el botón de arriba'}
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='border-b border-fp-border bg-fp-bg'>
                  {['Productos', 'Total', 'Tipo', 'Estado', 'Fecha', ''].map((h) => (
                    <th
                      key={h}
                      className='px-4 py-3 text-left text-xs text-fp-subtle uppercase tracking-wide font-medium'
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className='divide-y divide-fp-border-subtle'>
                {filtered.map((o) => (
                  <tr key={o._id} className='hover:bg-fp-elevated/50 transition-colors'>
                    <td className='px-4 py-3 text-fp-muted max-w-xs'>
                      <p className='truncate'>{o.product ?? '—'}</p>
                      {o.quantity > 1 && (
                        <p className='text-fp-subtle text-xs'>{o.quantity} unidades</p>
                      )}
                    </td>
                    <td className='px-4 py-3 text-fp-text font-medium whitespace-nowrap'>
                      {fmtMoney(o.price)}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          o.isDelivery
                            ? 'bg-blue-400/10 text-blue-400'
                            : 'bg-fp-elevated text-fp-muted'
                        }`}
                      >
                        {o.isDelivery ? 'Domicilio' : 'Recoger'}
                      </span>
                    </td>
                    <td className='px-4 py-3'>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[o.status] ?? STATUS_STYLE.PENDIENTE}`}
                      >
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-fp-subtle text-xs whitespace-nowrap'>
                      {fmtDate(o.createdAt)}
                    </td>
                    <td className='px-4 py-3'>
                      {o.status === 'PENDIENTE' && (
                        <button
                          onClick={() => handleCancel(o)}
                          disabled={cancelling === o._id}
                          className='text-xs text-fp-subtle hover:text-red-400 border border-fp-border hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50'
                        >
                          {cancelling === o._id ? '…' : 'Cancelar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateOrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={load}
        user={user}
      />
    </div>
  );
};
