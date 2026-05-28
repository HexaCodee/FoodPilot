import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  getRestaurants,
  createRestaurant,
  updateRestaurant,
  activateRestaurant,
  deactivateRestaurant,
  assignRestaurantAdmin,
  unassignRestaurantAdmin,
} from '../../../shared/apis/restaurants.js';
import { getUsers } from '../../../shared/apis/users.js';
import { StatusBadge } from '../../../shared/components/ui/Badge.jsx';
import {
  Modal,
  ModalActions,
  BtnPrimary,
  BtnSecondary,
} from '../../../shared/components/ui/Modal.jsx';
import {
  SearchIcon,
  BuildingIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../../shared/components/ui/Icons.jsx';

const CATEGORIES = [
  'FAST_FOOD',
  'FORMAL',
  'CAFETERIA',
  'ITALIANA',
  'MEXICANA',
  'MARISCOS',
  'PARRILLA',
  'VEGANA',
  'FUSION',
  'DESAYUNOS',
  'SUSHI',
];
const CAT_LABEL = {
  FAST_FOOD: 'Fast Food',
  FORMAL: 'Formal',
  CAFETERIA: 'Cafetería',
  ITALIANA: 'Italiana',
  MEXICANA: 'Mexicana',
  MARISCOS: 'Mariscos',
  PARRILLA: 'Parrilla',
  VEGANA: 'Vegana',
  FUSION: 'Fusión',
  DESAYUNOS: 'Desayunos',
  SUSHI: 'Sushi',
};

const EMPTY_FORM = {
  name: '',
  address: '',
  phone: '',
  category: 'FORMAL',
  description: '',
  email: '',
  website: '',
};

const Field = ({ label, error, children }) => (
  <div>
    <label className='block text-fp-muted text-xs uppercase tracking-wide mb-1.5'>{label}</label>
    {children}
    {error && <p className='text-red-400 text-xs mt-1'>{error}</p>}
  </div>
);

const Input = ({ value, onChange, placeholder, type = 'text' }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className='w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2.5 text-fp-text text-sm placeholder:text-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors'
  />
);

const Skeleton = () => (
  <tr>
    {[...Array(7)].map((_, i) => (
      <td key={i} className='px-4 py-3'>
        <div className='h-4 bg-fp-border rounded animate-pulse' />
      </td>
    ))}
  </tr>
);

// ── Admins modal ──────────────────────────────────────────────────────────────
const AdminsModal = ({ restaurant, onClose, onUpdated }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [assignedIds, setAssignedIds] = useState(new Set(restaurant?.adminUserIds ?? []));
  const debounce = useRef(null);

  const loadUsers = useCallback(async (s = '') => {
    setLoading(true);
    try {
      const r = await getUsers({ role: 'RESTAURANT_ADMIN', search: s || undefined, limit: 50 });
      setUsers(r.data?.users ?? r.data ?? []);
    } catch {
      toast.error('Error al cargar administradores');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => loadUsers(val), 400);
  };

  const handleToggle = async (user) => {
    const isAssigned = assignedIds.has(user.id);
    setToggling(user.id);
    try {
      if (isAssigned) {
        await unassignRestaurantAdmin(restaurant._id, user.id);
        setAssignedIds((prev) => { const n = new Set(prev); n.delete(user.id); return n; });
        toast.success(`${user.name} desasignado`);
      } else {
        await assignRestaurantAdmin(restaurant._id, user.id);
        setAssignedIds((prev) => new Set([...prev, user.id]));
        toast.success(`${user.name} asignado`);
      }
      onUpdated();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al actualizar la asignación');
    } finally {
      setToggling(null);
    }
  };

  return (
    <Modal isOpen={!!restaurant} onClose={onClose} title={`Administradores · ${restaurant?.name}`} maxWidth='max-w-lg'>
      <div className='space-y-4'>
        <p className='text-fp-subtle text-xs'>
          Asigna o desasigna administradores de restaurante. Solo verán este restaurante en su panel.
        </p>

        {/* Search */}
        <input
          type='text'
          value={search}
          onChange={handleSearch}
          placeholder='Buscar por nombre o usuario…'
          className='w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm placeholder:text-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors'
        />

        {/* User list */}
        <div className='space-y-1.5 max-h-72 overflow-y-auto'>
          {loading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className='h-12 bg-fp-elevated rounded-lg animate-pulse' />
            ))
          ) : users.length === 0 ? (
            <p className='text-fp-subtle text-sm text-center py-6'>No se encontraron administradores de restaurante</p>
          ) : (
            users.map((u) => {
              const assigned = assignedIds.has(u.id);
              return (
                <div
                  key={u.id}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg border transition-colors ${
                    assigned ? 'border-fp-gold/40 bg-fp-gold-dim' : 'border-fp-border bg-fp-bg'
                  }`}
                >
                  <div>
                    <p className='text-fp-text text-sm font-medium'>{u.name} {u.surname}</p>
                    <p className='text-fp-subtle text-xs'>{u.username} · {u.email}</p>
                  </div>
                  <button
                    onClick={() => handleToggle(u)}
                    disabled={toggling === u.id}
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                      assigned
                        ? 'bg-fp-elevated text-fp-muted hover:bg-red-900/20 hover:text-red-400'
                        : 'bg-fp-gold text-fp-bg hover:bg-fp-gold-hover'
                    }`}
                  >
                    {toggling === u.id ? '…' : assigned ? 'Desasignar' : 'Asignar'}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      <ModalActions>
        <BtnSecondary onClick={onClose}>Cerrar</BtnSecondary>
      </ModalActions>
    </Modal>
  );
};

export const AdminRestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Form modal
  const [modal, setModal] = useState({ open: false, mode: 'create', data: null });
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Status action loading
  const [statusLoading, setStatusLoading] = useState(null);

  // Admins modal
  const [adminsTarget, setAdminsTarget] = useState(null);

  const debounce = useRef(null);
  const LIMIT = 12;

  const load = useCallback(
    async (p = 1, s = search, cat = catFilter, active = statusFilter) => {
      setLoading(true);
      try {
        const isActiveParam = active === 'all' ? 'all' : active === 'active';
        const { data } = await getRestaurants({
          search: s || undefined,
          category: cat === 'all' ? undefined : cat,
          isActive: isActiveParam,
          page: p,
          limit: LIMIT,
        });
        setRestaurants(data.data ?? []);
        setTotal(data.pagination?.totalRecords ?? 0);
        setTotalPages(data.pagination?.totalPages ?? 1);
        setPage(p);
      } catch {
        toast.error('Error al cargar restaurantes');
      } finally {
        setLoading(false);
      }
    },
    [search, catFilter, statusFilter]
  );

  useEffect(() => {
    load(1);
  }, [catFilter, statusFilter]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(1, val, catFilter, statusFilter), 420);
  };

  // ── Form ─────────────────────────────────────────────────────
  const openCreate = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setModal({ open: true, mode: 'create', data: null });
  };

  const openEdit = (r) => {
    setForm({
      name: r.name ?? '',
      address: r.address ?? '',
      phone: r.phone ?? '',
      category: r.category ?? 'FORMAL',
      description: r.description ?? '',
      email: r.email ?? '',
      website: r.website ?? '',
    });
    setErrors({});
    setModal({ open: true, mode: 'edit', data: r });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'El nombre es obligatorio';
    if (!form.address.trim()) e.address = 'La dirección es obligatoria';
    if (!form.phone.trim()) e.phone = 'El teléfono es obligatorio';
    if (!form.category) e.category = 'La categoría es obligatoria';
    return e;
  };

  const handleSave = async () => {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone.trim(),
        category: form.category,
        description: form.description.trim() || undefined,
        email: form.email.trim() || undefined,
        website: form.website.trim() || undefined,
      };

      if (modal.mode === 'create') {
        await createRestaurant(payload);
        toast.success('Restaurante registrado');
      } else {
        await updateRestaurant(modal.data._id, payload);
        toast.success('Restaurante actualizado');
      }
      setModal({ open: false, mode: 'create', data: null });
      load(modal.mode === 'create' ? 1 : page);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (r) => {
    setStatusLoading(r._id);
    try {
      if (r.isActive) {
        await deactivateRestaurant(r._id);
        toast.success(`${r.name} desactivado`);
      } else {
        await activateRestaurant(r._id);
        toast.success(`${r.name} activado`);
      }
      load(page);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al cambiar estado');
    } finally {
      setStatusLoading(null);
    }
  };

  const setField = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key])
      setErrors((er) => {
        const n = { ...er };
        delete n[key];
        return n;
      });
  };

  const fmt = (date) =>
    date
      ? new Date(date).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : '—';

  return (
    <div className='space-y-5 animate-fadeUp'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <h1 className='font-display text-2xl text-fp-text'>Gestión de Restaurantes</h1>
          <p className='text-fp-muted text-sm mt-0.5'>
            {total > 0
              ? `${total} restaurante${total !== 1 ? 's' : ''} registrados`
              : 'Sin resultados'}
          </p>
        </div>
        <button
          onClick={openCreate}
          className='inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-fp-gold text-fp-bg font-medium text-sm hover:bg-fp-gold-hover transition-colors'
        >
          <span className='text-lg leading-none'>+</span>
          Nuevo restaurante
        </button>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-3'>
        <div className='relative flex-1 max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fp-subtle' />
          <input
            type='text'
            placeholder='Buscar por nombre o dirección…'
            value={search}
            onChange={handleSearchChange}
            className='w-full bg-fp-surface border border-fp-border rounded-lg pl-9 pr-4 py-2.5 text-fp-text text-sm placeholder:text-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors'
          />
        </div>

        <select
          value={catFilter}
          onChange={(e) => {
            setCatFilter(e.target.value);
            setPage(1);
          }}
          className='bg-fp-surface border border-fp-border rounded-lg px-4 py-2.5 text-fp-text text-sm focus:outline-none focus:border-fp-gold/50 transition-colors'
        >
          <option value='all'>Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {CAT_LABEL[c]}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className='bg-fp-surface border border-fp-border rounded-lg px-4 py-2.5 text-fp-text text-sm focus:outline-none focus:border-fp-gold/50 transition-colors'
        >
          <option value='all'>Todos los estados</option>
          <option value='active'>Activos</option>
          <option value='inactive'>Inactivos</option>
        </select>
      </div>

      {/* Table */}
      <div className='bg-fp-surface border border-fp-border rounded-xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-fp-border'>
                {['Restaurante', 'Categoría', 'Teléfono', 'Estado', 'Admins', 'Creado', 'Acciones'].map(
                  (h) => (
                    <th
                      key={h}
                      className='px-4 py-3 text-left text-fp-subtle text-xs uppercase tracking-wide font-medium whitespace-nowrap'
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className='divide-y divide-fp-border-subtle'>
              {loading ? (
                [...Array(LIMIT)].map((_, i) => <Skeleton key={i} />)
              ) : restaurants.length === 0 ? (
                <tr>
                  <td colSpan={7} className='py-16 text-center'>
                    <BuildingIcon className='w-10 h-10 text-fp-subtle mx-auto mb-3' />
                    <p className='text-fp-muted text-sm'>No se encontraron restaurantes</p>
                    <button
                      onClick={openCreate}
                      className='mt-3 text-fp-gold text-sm hover:underline'
                    >
                      Crear el primero
                    </button>
                  </td>
                </tr>
              ) : (
                restaurants.map((r) => (
                  <tr key={r._id} className='hover:bg-fp-bg/40 transition-colors group'>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <div>
                        <p className='text-fp-text font-medium'>{r.name}</p>
                        <p className='text-fp-subtle text-xs truncate max-w-[220px]'>{r.address}</p>
                      </div>
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <span className='text-fp-muted text-xs px-2 py-0.5 rounded border border-fp-border bg-fp-bg'>
                        {CAT_LABEL[r.category] ?? r.category}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-fp-muted whitespace-nowrap'>{r.phone}</td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <StatusBadge active={r.isActive} />
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <span className='text-fp-subtle text-xs'>
                        {(r.adminUserIds?.length ?? 0) === 0
                          ? <span className='text-fp-subtle/60 italic'>Sin asignar</span>
                          : `${r.adminUserIds.length} admin${r.adminUserIds.length !== 1 ? 's' : ''}`}
                      </span>
                    </td>
                    <td className='px-4 py-3 text-fp-muted whitespace-nowrap text-xs'>
                      {fmt(r.createdAt)}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <button
                          onClick={() => setAdminsTarget(r)}
                          className='px-2.5 py-1 text-xs rounded-md border border-blue-700/40 text-blue-400 hover:bg-blue-900/20 transition-colors'
                        >
                          Admins
                        </button>
                        <button
                          onClick={() => openEdit(r)}
                          className='px-2.5 py-1 text-xs rounded-md border border-fp-border text-fp-muted hover:text-fp-gold hover:border-fp-gold/40 transition-colors'
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleToggleStatus(r)}
                          disabled={statusLoading === r._id}
                          className={`px-2.5 py-1 text-xs rounded-md border transition-colors disabled:opacity-50
                              ${
                                r.isActive
                                  ? 'border-red-700/40 text-red-400 hover:bg-red-900/20'
                                  : 'border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/20'
                              }`}
                        >
                          {statusLoading === r._id ? '…' : r.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-between px-4 py-3 border-t border-fp-border'>
            <p className='text-fp-subtle text-xs'>
              Página {page} de {totalPages} &middot; {total} registros
            </p>
            <div className='flex items-center gap-1'>
              <button
                onClick={() => load(page - 1)}
                disabled={page <= 1 || loading}
                className='p-1.5 rounded-lg border border-fp-border text-fp-muted hover:text-fp-text hover:border-fp-gold/30 disabled:opacity-40 transition-colors'
              >
                <ChevronLeftIcon className='w-4 h-4' />
              </button>
              <button
                onClick={() => load(page + 1)}
                disabled={page >= totalPages || loading}
                className='p-1.5 rounded-lg border border-fp-border text-fp-muted hover:text-fp-text hover:border-fp-gold/30 disabled:opacity-40 transition-colors'
              >
                <ChevronRightIcon className='w-4 h-4' />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admins modal */}
      {adminsTarget && (
        <AdminsModal
          restaurant={adminsTarget}
          onClose={() => setAdminsTarget(null)}
          onUpdated={() => load(page)}
        />
      )}

      {/* Create / Edit modal */}
      <Modal
        isOpen={modal.open}
        onClose={() => setModal({ open: false, mode: 'create', data: null })}
        title={modal.mode === 'create' ? 'Nuevo restaurante' : 'Editar restaurante'}
        maxWidth='max-w-xl'
      >
        <div className='space-y-4'>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <Field label='Nombre *' error={errors.name}>
              <Input
                value={form.name}
                onChange={setField('name')}
                placeholder='El Rincón Gourmet'
              />
            </Field>
            <Field label='Categoría *' error={errors.category}>
              <select
                value={form.category}
                onChange={setField('category')}
                className='w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2.5 text-fp-text text-sm focus:outline-none focus:border-fp-gold/50 transition-colors'
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CAT_LABEL[c]}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label='Dirección *' error={errors.address}>
            <Input
              value={form.address}
              onChange={setField('address')}
              placeholder='Av. Principal 123, Ciudad'
            />
          </Field>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <Field label='Teléfono *' error={errors.phone}>
              <Input
                value={form.phone}
                onChange={setField('phone')}
                placeholder='+52 55 0000 0000'
              />
            </Field>
            <Field label='Email' error={errors.email}>
              <Input
                value={form.email}
                onChange={setField('email')}
                placeholder='contacto@restaurante.com'
                type='email'
              />
            </Field>
          </div>

          <Field label='Sitio web' error={errors.website}>
            <Input
              value={form.website}
              onChange={setField('website')}
              placeholder='https://mirestaurante.com'
            />
          </Field>

          <Field label='Descripción' error={errors.description}>
            <textarea
              value={form.description}
              onChange={setField('description')}
              placeholder='Breve descripción del restaurante…'
              rows={3}
              className='w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2.5 text-fp-text text-sm placeholder:text-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors resize-none'
            />
          </Field>
        </div>

        <ModalActions>
          <BtnSecondary onClick={() => setModal({ open: false, mode: 'create', data: null })}>
            Cancelar
          </BtnSecondary>
          <BtnPrimary onClick={handleSave} loading={saving}>
            {modal.mode === 'create' ? 'Crear restaurante' : 'Guardar cambios'}
          </BtnPrimary>
        </ModalActions>
      </Modal>
    </div>
  );
};
