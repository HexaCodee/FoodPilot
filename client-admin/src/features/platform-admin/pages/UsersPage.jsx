import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  getUsers,
  updateUserRole,
  activateUser,
  deactivateUser,
} from '../../../shared/apis/users.js';
import { RoleBadge, StatusBadge, EmailBadge } from '../../../shared/components/ui/Badge.jsx';
import {
  Modal,
  ModalActions,
  BtnPrimary,
  BtnSecondary,
} from '../../../shared/components/ui/Modal.jsx';
import {
  SearchIcon,
  UsersIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '../../../shared/components/ui/Icons.jsx';

const ROLES = ['all', 'CLIENT', 'RESTAURANT_ADMIN', 'PLATFORM_ADMIN'];
const ROLE_LABELS = {
  all: 'Todos los roles',
  CLIENT: 'Cliente',
  RESTAURANT_ADMIN: 'Admin Restaurante',
  PLATFORM_ADMIN: 'Admin Plataforma',
};

const ASSIGNABLE_ROLES = ['CLIENT', 'RESTAURANT_ADMIN', 'PLATFORM_ADMIN'];

const Skeleton = () => (
  <tr>
    {[...Array(7)].map((_, i) => (
      <td key={i} className='px-4 py-3'>
        <div className='h-4 bg-fp-border rounded animate-pulse' />
      </td>
    ))}
  </tr>
);

export const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Change-role modal
  const [roleModal, setRoleModal] = useState({ open: false, user: null });
  const [selectedRole, setSelectedRole] = useState('');
  const [saving, setSaving] = useState(false);

  // Status action loading
  const [statusLoading, setStatusLoading] = useState(null);

  const searchRef = useRef(null);
  const debounce = useRef(null);

  const LIMIT = 15;

  const load = useCallback(
    async (p = 1, s = search, r = roleFilter) => {
      setLoading(true);
      try {
        const { data } = await getUsers({ search: s || undefined, role: r, page: p, limit: LIMIT });
        setUsers(data.users ?? []);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setPage(p);
      } catch {
        toast.error('Error al cargar usuarios');
      } finally {
        setLoading(false);
      }
    },
    [search, roleFilter]
  );

  useEffect(() => {
    load(1);
  }, [roleFilter]);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(1, val, roleFilter), 420);
  };

  // ── Role change ──────────────────────────────────────────────
  const openRoleModal = (user) => {
    setRoleModal({ open: true, user });
    setSelectedRole(user.role);
  };

  const handleRoleChange = async () => {
    if (!selectedRole || selectedRole === roleModal.user?.role) {
      setRoleModal({ open: false, user: null });
      return;
    }
    setSaving(true);
    try {
      await updateUserRole(roleModal.user.id, selectedRole);
      toast.success('Rol actualizado');
      setRoleModal({ open: false, user: null });
      load(page);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al cambiar el rol');
    } finally {
      setSaving(false);
    }
  };

  // ── Status toggle ────────────────────────────────────────────
  const handleToggleStatus = async (user) => {
    setStatusLoading(user.id);
    try {
      if (user.status) {
        await deactivateUser(user.id);
        toast.success(`${user.name} desactivado`);
      } else {
        await activateUser(user.id);
        toast.success(`${user.name} activado`);
      }
      load(page);
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Error al cambiar estado');
    } finally {
      setStatusLoading(null);
    }
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
          <h1 className='font-display text-2xl text-fp-text'>Gestión de Usuarios</h1>
          <p className='text-fp-muted text-sm mt-0.5'>
            {total > 0 ? `${total} usuario${total !== 1 ? 's' : ''} registrados` : 'Sin resultados'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='flex flex-col sm:flex-row gap-3'>
        {/* Search */}
        <div className='relative flex-1 max-w-sm'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-fp-subtle' />
          <input
            ref={searchRef}
            type='text'
            placeholder='Buscar por nombre, email o username…'
            value={search}
            onChange={handleSearchChange}
            className='w-full bg-fp-surface border border-fp-border rounded-lg pl-9 pr-4 py-2.5 text-fp-text text-sm placeholder:text-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors'
          />
        </div>

        {/* Role filter */}
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className='bg-fp-surface border border-fp-border rounded-lg px-4 py-2.5 text-fp-text text-sm focus:outline-none focus:border-fp-gold/50 transition-colors'
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className='bg-fp-surface border border-fp-border rounded-xl overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='border-b border-fp-border'>
                {[
                  'Usuario',
                  'Email',
                  'Rol',
                  'Estado',
                  'Email verificado',
                  'Registro',
                  'Acciones',
                ].map((h) => (
                  <th
                    key={h}
                    className='px-4 py-3 text-left text-fp-subtle text-xs uppercase tracking-wide font-medium whitespace-nowrap'
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-fp-border-subtle'>
              {loading ? (
                [...Array(LIMIT)].map((_, i) => <Skeleton key={i} />)
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className='py-16 text-center'>
                    <UsersIcon className='w-10 h-10 text-fp-subtle mx-auto mb-3' />
                    <p className='text-fp-muted text-sm'>No se encontraron usuarios</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className='hover:bg-fp-bg/40 transition-colors group'>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <div className='flex items-center gap-3'>
                        {u.profilePicture ? (
                          <img
                            src={u.profilePicture}
                            alt={u.username}
                            className='w-8 h-8 rounded-full object-cover border border-fp-gold/20 flex-shrink-0'
                          />
                        ) : (
                          <div className='w-8 h-8 rounded-full bg-fp-gold-dim border border-fp-gold/20 flex items-center justify-center flex-shrink-0'>
                            <span className='text-fp-gold text-xs font-semibold'>
                              {u.name?.[0]?.toUpperCase()}
                              {u.surname?.[0]?.toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className='text-fp-text font-medium'>
                            {u.name} {u.surname}
                          </p>
                          <p className='text-fp-subtle text-xs'>@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-4 py-3 text-fp-muted whitespace-nowrap'>{u.email}</td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <RoleBadge role={u.role} />
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <StatusBadge active={u.status} />
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <EmailBadge verified={u.isEmailVerified} />
                    </td>
                    <td className='px-4 py-3 text-fp-muted whitespace-nowrap text-xs'>
                      {fmt(u.createdAt)}
                    </td>
                    <td className='px-4 py-3 whitespace-nowrap'>
                      <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                        <button
                          onClick={() => openRoleModal(u)}
                          className='px-2.5 py-1 text-xs rounded-md border border-fp-border text-fp-muted hover:text-fp-gold hover:border-fp-gold/40 transition-colors'
                        >
                          Rol
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={statusLoading === u.id}
                          className={`px-2.5 py-1 text-xs rounded-md border transition-colors disabled:opacity-50
                              ${
                                u.status
                                  ? 'border-red-700/40 text-red-400 hover:bg-red-900/20'
                                  : 'border-emerald-700/40 text-emerald-400 hover:bg-emerald-900/20'
                              }`}
                        >
                          {statusLoading === u.id ? '…' : u.status ? 'Desactivar' : 'Activar'}
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

      {/* Change-role modal */}
      <Modal
        isOpen={roleModal.open}
        onClose={() => setRoleModal({ open: false, user: null })}
        title='Cambiar rol de usuario'
      >
        {roleModal.user && (
          <>
            <div className='flex items-center gap-3 mb-5 p-3 rounded-lg bg-fp-bg border border-fp-border'>
              {roleModal.user.profilePicture ? (
                <img
                  src={roleModal.user.profilePicture}
                  alt={roleModal.user.username}
                  className='w-9 h-9 rounded-full object-cover border border-fp-gold/20 flex-shrink-0'
                />
              ) : (
                <div className='w-9 h-9 rounded-full bg-fp-gold-dim border border-fp-gold/20 flex items-center justify-center flex-shrink-0'>
                  <span className='text-fp-gold text-sm font-semibold'>
                    {roleModal.user.name?.[0]?.toUpperCase()}
                    {roleModal.user.surname?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className='text-fp-text font-medium text-sm'>
                  {roleModal.user.name} {roleModal.user.surname}
                </p>
                <p className='text-fp-subtle text-xs'>{roleModal.user.email}</p>
              </div>
            </div>

            <label className='block text-fp-muted text-xs uppercase tracking-wide mb-2'>
              Nuevo rol
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className='w-full bg-fp-bg border border-fp-border rounded-lg px-4 py-2.5 text-fp-text text-sm focus:outline-none focus:border-fp-gold/50 transition-colors'
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>

            <ModalActions>
              <BtnSecondary onClick={() => setRoleModal({ open: false, user: null })}>
                Cancelar
              </BtnSecondary>
              <BtnPrimary onClick={handleRoleChange} loading={saving}>
                Guardar cambio
              </BtnPrimary>
            </ModalActions>
          </>
        )}
      </Modal>
    </div>
  );
};
