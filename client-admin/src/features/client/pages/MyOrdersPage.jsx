import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore }  from '../../auth/store/authStore.js';
import { getOrders, createOrder, cancelOrder } from '../../../shared/apis/orders.js';
import { Modal, ModalActions, BtnPrimary, BtnSecondary } from '../../../shared/components/ui/Modal.jsx';
import { BagIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Helpers ───────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const STATUS_LABEL = { PENDIENTE: 'Pendiente', ENVIADO: 'En camino', ENTREGADO: 'Entregado', CANCELADO: 'Cancelado' };
const STATUS_STYLE = {
  PENDIENTE:  'bg-fp-gold-dim    text-fp-gold',
  ENVIADO:    'bg-blue-400/10   text-blue-400',
  ENTREGADO:  'bg-fp-success-dim text-fp-success',
  CANCELADO:  'bg-red-900/30    text-red-400',
};

const fmtMoney = (n) => (typeof n === 'number' ? `$${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}` : '—');

const TABS = ['Todos', 'PENDIENTE', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];

// ── Create order modal ────────────────────────────────────────────────────────
const CreateOrderModal = ({ isOpen, onClose, onCreated, defaultName, userId }) => {
  const [form, setForm]     = useState({ customerName: '', product: '', quantity: 1, price: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) setForm({ customerName: defaultName ?? '', product: '', quantity: 1, price: '' });
  }, [isOpen, defaultName]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createOrder({
        customerName: form.customerName.trim(),
        product:      form.product.trim(),
        quantity:     Number(form.quantity),
        price:        form.price !== '' ? Number(form.price) : undefined,
        userId:       userId,
      });
      toast.success('Pedido creado');
      onCreated();
      onClose();
    } catch (err) {
      const apiErrors = err?.response?.data?.errors;
      const msg = Array.isArray(apiErrors) && apiErrors.length > 0
        ? apiErrors[0].msg
        : (err?.response?.data?.message ?? 'Error al crear el pedido');
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const field = 'w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm placeholder-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors';
  const label = 'block text-fp-subtle text-xs mb-1';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo pedido">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className={label}>Nombre del cliente *</label>
          <input className={field} value={form.customerName}
            onChange={(e) => set('customerName', e.target.value)}
            placeholder="Tu nombre" required />
        </div>
        <div>
          <label className={label}>Producto *</label>
          <input className={field} value={form.product}
            onChange={(e) => set('product', e.target.value)}
            placeholder="Ej. Pizza Margherita" required />
        </div>
        <div>
          <label className={label}>Cantidad *</label>
          <input type="number" min="1" className={field} value={form.quantity}
            onChange={(e) => set('quantity', e.target.value)} required />
        </div>
        <div>
          <label className={label}>Precio (opcional)</label>
          <input type="number" min="0" step="0.01" className={field} value={form.price}
            onChange={(e) => set('price', e.target.value)} placeholder="Ej. 15.99" />
        </div>
        <ModalActions>
          <BtnSecondary onClick={onClose} disabled={saving}>Cancelar</BtnSecondary>
          <BtnPrimary type="submit" loading={saving}>Crear pedido</BtnPrimary>
        </ModalActions>
      </form>
    </Modal>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const MyOrdersPage = () => {
  const user = useAuthStore((s) => s.user);

  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [tab, setTab]             = useState('Todos');
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

  useEffect(() => { load(); }, [load]);

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
    <div className="space-y-6 animate-fadeUp">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-fp-text">Mis Pedidos</h1>
          <p className="text-fp-muted text-sm mt-0.5">
            {loading ? 'Cargando…' : `${orders.length} pedido${orders.length !== 1 ? 's' : ''} registrado${orders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-fp-gold text-fp-bg text-sm font-medium rounded-lg hover:bg-fp-gold-hover transition-colors"
        >
          <BagIcon className="w-4 h-4" />
          Nuevo pedido
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 bg-fp-elevated p-1 rounded-lg w-fit flex-wrap">
        {TABS.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === t ? 'bg-fp-surface text-fp-text shadow-sm' : 'text-fp-muted hover:text-fp-text'
            }`}>
            {t === 'Todos' ? 'Todos' : STATUS_LABEL[t]} ({counts[t]})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-fp-surface border border-fp-border rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <BagIcon className="w-10 h-10 text-fp-muted mb-3" />
            <p className="text-fp-text font-medium">Sin pedidos</p>
            <p className="text-fp-subtle text-sm mt-1">
              {tab !== 'Todos' ? `No hay pedidos con estado "${STATUS_LABEL[tab]}"` : 'Crea tu primer pedido con el botón de arriba'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-fp-border bg-fp-bg">
                  {['Cliente', 'Producto', 'Cant.', 'Precio', 'Estado', 'Fecha', ''].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-fp-subtle uppercase tracking-wide font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-fp-border-subtle">
                {filtered.map((o) => (
                  <tr key={o._id} className="hover:bg-fp-elevated/50 transition-colors">
                    <td className="px-4 py-3 text-fp-text font-medium">{o.customerName}</td>
                    <td className="px-4 py-3 text-fp-muted">{o.product}</td>
                    <td className="px-4 py-3 text-fp-muted text-center">{o.quantity}</td>
                    <td className="px-4 py-3 text-fp-text font-medium">{fmtMoney(o.price)}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_STYLE[o.status] ?? STATUS_STYLE.PENDIENTE}`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-fp-subtle text-xs">{fmtDate(o.createdAt)}</td>
                    <td className="px-4 py-3">
                      {o.status === 'PENDIENTE' && (
                        <button
                          onClick={() => handleCancel(o)}
                          disabled={cancelling === o._id}
                          className="text-xs text-fp-subtle hover:text-red-400 border border-fp-border hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50"
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
        defaultName={user?.username ?? ''}
        userId={user?.id}
      />
    </div>
  );
};
