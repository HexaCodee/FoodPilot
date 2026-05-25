import { useEffect, useState, useCallback } from 'react';
import { getOrders, updateOrderStatus } from '../../../shared/apis/orders.js';
import { Modal, ModalActions, BtnSecondary } from '../../../shared/components/ui/Modal.jsx';
import { BagIcon, ClipboardIcon } from '../../../shared/components/ui/Icons.jsx';

// ── Constants ─────────────────────────────────────────────────────────────────
const STATUSES = ['PENDIENTE', 'ENVIADO', 'ENTREGADO', 'CANCELADO'];
const STATUS_LABEL = {
  PENDIENTE: 'Pendiente',
  ENVIADO: 'En camino',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
};
const STATUS_COLOR = {
  PENDIENTE: 'text-fp-gold    bg-fp-gold-dim',
  ENVIADO: 'text-blue-400   bg-blue-400/10',
  ENTREGADO: 'text-fp-success bg-fp-success-dim',
  CANCELADO: 'text-red-400    bg-red-400/10',
};

const fmtMoney = (n) =>
  typeof n === 'number' ? `$${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })}` : '—';

const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-fp-elevated rounded ${className}`} />
);

const formatDate = (d) => {
  if (!d) return '—';
  return new Date(d).toLocaleString('es', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ── Factura / Receipt modal ───────────────────────────────────────────────────
const FacturaModal = ({ order, onClose }) => {
  if (!order) return null;
  const handlePrint = () => window.print();

  return (
    <Modal isOpen={!!order} onClose={onClose} title='Factura / Recibo'>
      <div id='factura-content' className='space-y-4'>
        <div className='flex items-center justify-between border-b border-fp-border pb-3'>
          <div>
            <p className='text-fp-text font-display text-lg'>FoodPilot</p>
            <p className='text-fp-subtle text-xs'>Recibo de pedido</p>
          </div>
          <div className='text-right'>
            <p className='text-fp-subtle text-xs'>ID</p>
            <p className='text-fp-text text-xs font-mono'>…{order._id?.slice(-8)}</p>
          </div>
        </div>

        <div className='space-y-1.5 text-sm'>
          <div className='flex justify-between'>
            <span className='text-fp-subtle'>Cliente</span>
            <span className='text-fp-text font-medium'>{order.customerName}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-fp-subtle'>Producto</span>
            <span className='text-fp-text'>{order.product}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-fp-subtle'>Cantidad</span>
            <span className='text-fp-text'>{order.quantity}</span>
          </div>
          <div className='flex justify-between'>
            <span className='text-fp-subtle'>Estado</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLOR[order.status] ?? STATUS_COLOR.PENDIENTE}`}
            >
              {STATUS_LABEL[order.status] ?? order.status}
            </span>
          </div>
          <div className='flex justify-between'>
            <span className='text-fp-subtle'>Fecha</span>
            <span className='text-fp-text'>{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className='border-t border-fp-border pt-3 flex justify-between items-center'>
          <span className='text-fp-text font-semibold'>Total</span>
          <span className='text-fp-gold text-xl font-bold'>{fmtMoney(order.price)}</span>
        </div>
      </div>

      <ModalActions>
        <BtnSecondary onClick={onClose}>Cerrar</BtnSecondary>
        <button
          onClick={handlePrint}
          className='flex items-center gap-2 px-4 py-2 bg-fp-gold text-fp-bg text-sm font-medium rounded-lg hover:bg-fp-gold-hover transition-colors'
        >
          <ClipboardIcon className='w-4 h-4' />
          Imprimir
        </button>
      </ModalActions>
    </Modal>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
export const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState({});
  const [factura, setFactura] = useState(null);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    getOrders({ limit: 100 })
      .then((r) => {
        const d = r.data;
        setOrders(Array.isArray(d) ? d : (d?.orders ?? []));
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (order, newStatus) => {
    setBusy((p) => ({ ...p, [order._id]: true }));
    try {
      await updateOrderStatus(order._id, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status: newStatus } : o)));
    } catch {
      // silently ignore
    } finally {
      setBusy((p) => ({ ...p, [order._id]: false }));
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className='space-y-6 animate-fadeUp'>
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h1 className='font-display text-2xl text-fp-text'>Pedidos</h1>
          <p className='text-fp-muted text-sm mt-0.5'>
            {orders.length} pedido{orders.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className='px-4 py-2 border border-fp-border text-fp-muted hover:text-fp-text hover:border-fp-gold/30 text-sm rounded-lg transition-colors'
        >
          Actualizar
        </button>
      </div>

      {/* Status filter */}
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
            {s === 'all'
              ? `Todos (${orders.length})`
              : `${STATUS_LABEL[s]} (${orders.filter((o) => o.status === s).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className='bg-fp-surface border border-fp-border rounded-xl overflow-hidden'>
        {/* Table header */}
        <div className='grid grid-cols-[1fr_1fr_60px_90px_140px_150px_50px] gap-3 px-5 py-3 border-b border-fp-border bg-fp-elevated'>
          {['Cliente', 'Producto', 'Cant.', 'Precio', 'Estado', 'Fecha', ''].map((h) => (
            <span key={h} className='text-fp-muted text-xs font-medium uppercase tracking-wide'>
              {h}
            </span>
          ))}
        </div>

        {loading ? (
          <div className='p-4 space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className='h-12 w-full' />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-fp-muted gap-3'>
            <BagIcon className='w-10 h-10 opacity-30' />
            <p className='text-sm'>
              No hay pedidos {filter !== 'all' ? `con estado "${STATUS_LABEL[filter]}"` : ''}
            </p>
          </div>
        ) : (
          <div className='divide-y divide-fp-border-subtle'>
            {filtered.map((order) => (
              <div
                key={order._id}
                className='grid grid-cols-[1fr_1fr_60px_90px_140px_150px_50px] gap-3 px-5 py-4 items-center hover:bg-fp-elevated/50 transition-colors'
              >
                <p className='text-fp-text text-sm truncate'>{order.customerName}</p>
                <p className='text-fp-muted text-sm truncate'>{order.product}</p>
                <p className='text-fp-text text-sm text-center'>{order.quantity}</p>
                <p className='text-fp-text text-sm font-medium'>{fmtMoney(order.price)}</p>

                {/* Status selector */}
                <select
                  value={order.status}
                  disabled={!!busy[order._id] || order.status === 'CANCELADO'}
                  onChange={(e) => handleStatusChange(order, e.target.value)}
                  className={`text-xs font-medium px-2.5 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none disabled:opacity-60 ${STATUS_COLOR[order.status] ?? STATUS_COLOR.PENDIENTE}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className='bg-fp-surface text-fp-text'>
                      {STATUS_LABEL[s]}
                    </option>
                  ))}
                </select>

                <p className='text-fp-subtle text-xs'>{formatDate(order.createdAt)}</p>

                {/* Factura button */}
                <button
                  onClick={() => setFactura(order)}
                  title='Ver factura'
                  className='p-1.5 rounded-lg text-fp-subtle hover:text-fp-gold hover:bg-fp-gold-dim transition-colors'
                >
                  <ClipboardIcon className='w-4 h-4' />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <FacturaModal order={factura} onClose={() => setFactura(null)} />
    </div>
  );
};
