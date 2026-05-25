import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../auth/store/authStore.js';
import { updateProfile, deleteAccount } from '../../../shared/apis/auth.js';
import { uploadImage } from '../../../shared/apis/upload.js';
import { UserIcon } from '../../../shared/components/ui/Icons.jsx';

const ROLE_LABEL = {
  CLIENT: 'Cliente',
  RESTAURANT_ADMIN: 'Admin Restaurante',
  PLATFORM_ADMIN: 'Admin Plataforma',
};

const ROLE_STYLE = {
  CLIENT: 'bg-blue-400/10   text-blue-400',
  RESTAURANT_ADMIN: 'bg-fp-gold-dim   text-fp-gold',
  PLATFORM_ADMIN: 'bg-purple-400/10 text-purple-400',
};

const InfoRow = ({ label, value }) => (
  <div className='flex items-center justify-between py-3 border-b border-fp-border-subtle last:border-0'>
    <span className='text-fp-subtle text-sm'>{label}</span>
    <span className='text-fp-text text-sm font-medium'>{value ?? '—'}</span>
  </div>
);

export const ProfilePage = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username ?? '');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Profile picture
  const [picFile, setPicFile] = useState(null);
  const [picPreview, setPicPreview] = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);
  const picInputRef = useRef(null);

  const handlePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicFile(file);
    setPicPreview(URL.createObjectURL(file));
  };

  const handleUploadPic = async () => {
    if (!picFile) return;
    setUploadingPic(true);
    try {
      const url = await uploadImage(picFile);
      // Save picture URL + keep current username
      const { data } = await updateProfile({
        username: user?.username ?? username.trim(),
        profilePictureUrl: url,
      });
      useAuthStore.setState((state) => ({
        user: { ...state.user, profilePicture: data.userDetails?.profilePicture ?? url },
      }));
      setPicFile(null);
      setPicPreview('');
      toast.success('Foto de perfil actualizada');
    } catch (err) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'Error al subir la imagen';
      toast.error(msg);
    } finally {
      setUploadingPic(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setSaving(true);
    try {
      const { data } = await updateProfile({ username: username.trim() });
      useAuthStore.setState((state) => ({
        user: { ...state.user, username: data.userDetails?.username ?? username.trim() },
      }));
      toast.success('Perfil actualizado');
      setEditing(false);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Error al actualizar el perfil';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setUsername(user?.username ?? '');
    setEditing(false);
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      toast.success('Cuenta eliminada');
      logout();
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Error al eliminar la cuenta';
      toast.error(msg);
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const field =
    'w-full bg-fp-bg border border-fp-border rounded-lg px-3 py-2 text-fp-text text-sm placeholder-fp-subtle focus:outline-none focus:border-fp-gold/50 transition-colors';

  return (
    <div className='space-y-6 animate-fadeUp max-w-lg'>
      <div>
        <h1 className='font-display text-2xl text-fp-text'>Mi Perfil</h1>
        <p className='text-fp-muted text-sm mt-0.5'>Información de tu cuenta</p>
      </div>

      {/* Avatar + name */}
      <div className='bg-fp-surface border border-fp-border rounded-xl p-6 flex items-center gap-5'>
        {/* Clickable avatar */}
        <div className='relative flex-shrink-0 group' onClick={() => picInputRef.current?.click()}>
          {picPreview || user?.profilePicture ? (
            <img
              src={picPreview || user.profilePicture}
              alt={user?.username}
              className='w-16 h-16 rounded-full object-cover border-2 border-fp-gold/30 cursor-pointer'
            />
          ) : (
            <div className='w-16 h-16 rounded-full bg-fp-gold-dim border-2 border-fp-gold/20 flex items-center justify-center cursor-pointer'>
              <UserIcon className='w-8 h-8 text-fp-gold' />
            </div>
          )}
          {/* Hover overlay */}
          <div className='absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer'>
            <span className='text-white text-xs font-medium'>Cambiar</span>
          </div>
        </div>
        <input
          ref={picInputRef}
          type='file'
          accept='image/jpeg,image/jpg,image/png,image/webp'
          className='hidden'
          onChange={handlePicChange}
        />

        <div className='flex-1 min-w-0'>
          <p className='text-fp-text text-lg font-semibold truncate'>{user?.username ?? '—'}</p>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium mt-1 inline-block ${ROLE_STYLE[user?.role] ?? ROLE_STYLE.CLIENT}`}
          >
            {ROLE_LABEL[user?.role] ?? user?.role ?? '—'}
          </span>
          {/* Upload button — only visible when a new file is chosen */}
          {picFile && (
            <div className='mt-2 flex items-center gap-2'>
              <button
                onClick={handleUploadPic}
                disabled={uploadingPic}
                className='px-3 py-1 text-xs bg-fp-gold text-fp-bg rounded-lg hover:bg-fp-gold-hover transition-colors disabled:opacity-50 font-medium'
              >
                {uploadingPic ? 'Subiendo…' : 'Guardar foto'}
              </button>
              <button
                onClick={() => {
                  setPicFile(null);
                  setPicPreview('');
                }}
                disabled={uploadingPic}
                className='text-xs text-fp-muted hover:text-fp-text transition-colors'
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className='bg-fp-surface border border-fp-border rounded-xl p-5'>
        <h3 className='text-fp-text font-medium text-sm mb-3'>Detalles de la cuenta</h3>
        <InfoRow label='Rol' value={ROLE_LABEL[user?.role] ?? user?.role} />
        <InfoRow label='ID de cuenta' value={user?.id ? `…${user.id.slice(-8)}` : null} />
      </div>

      {/* Edit username */}
      <div className='bg-fp-surface border border-fp-border rounded-xl p-5'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-fp-text font-medium text-sm'>Nombre de usuario</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className='text-xs text-fp-gold hover:text-fp-gold-hover font-medium transition-colors'
            >
              Editar
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className='space-y-3'>
            <input
              className={field}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder='Nuevo nombre de usuario'
              minLength={3}
              maxLength={25}
              required
            />
            <div className='flex gap-2 justify-end'>
              <button
                type='button'
                onClick={handleCancel}
                disabled={saving}
                className='px-3 py-1.5 text-xs text-fp-muted border border-fp-border rounded-lg hover:text-fp-text hover:border-fp-gold/30 transition-colors disabled:opacity-50'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={saving || !username.trim()}
                className='px-3 py-1.5 text-xs bg-fp-gold text-fp-bg rounded-lg hover:bg-fp-gold-hover transition-colors disabled:opacity-50 font-medium'
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        ) : (
          <p className='text-fp-text text-sm font-medium'>{user?.username ?? '—'}</p>
        )}
      </div>

      {/* Danger zone */}
      <div className='bg-fp-surface border border-red-500/20 rounded-xl p-5'>
        <h3 className='text-red-400 font-medium text-sm mb-1'>Zona de peligro</h3>
        <p className='text-fp-subtle text-xs mb-4'>
          Eliminar tu cuenta es una acción permanente. Todos tus datos serán borrados.
        </p>

        {confirmDelete ? (
          <div className='space-y-3'>
            <p className='text-fp-text text-sm'>
              ¿Estás seguro? Esta acción <strong>no se puede deshacer</strong>.
            </p>
            <div className='flex gap-2'>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className='px-3 py-1.5 text-xs text-fp-muted border border-fp-border rounded-lg hover:text-fp-text transition-colors disabled:opacity-50'
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className='px-3 py-1.5 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 font-medium'
              >
                {deleting ? 'Eliminando…' : 'Sí, eliminar mi cuenta'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className='px-3 py-1.5 text-xs text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors font-medium'
          >
            Eliminar mi cuenta
          </button>
        )}
      </div>
    </div>
  );
};
