import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import { uploadImage } from '../../../shared/apis/upload.js';
import toast from 'react-hot-toast';

export const RegisterForm = ({ onSwitch }) => {
  const registerUser = useAuthStore((s) => s.register);
  const loading      = useAuthStore((s) => s.loading);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const password = watch('password');

  // Profile picture state
  const [picFile, setPicFile]         = useState(null);
  const [picPreview, setPicPreview]   = useState('');
  const [uploadingPic, setUploadingPic] = useState(false);
  const picInputRef = useRef(null);

  const handlePicChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicFile(file);
    setPicPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    // 1. Upload photo if selected
    let profilePictureUrl = '';
    if (picFile) {
      setUploadingPic(true);
      try {
        profilePictureUrl = await uploadImage(picFile);
      } catch {
        toast.error('No se pudo subir la foto de perfil — continuando sin ella');
      } finally {
        setUploadingPic(false);
      }
    }

    // 2. Build FormData for registration
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k !== 'confirmPassword') formData.append(k, v);
    });
    if (profilePictureUrl) formData.append('profilePictureUrl', profilePictureUrl);

    // 3. Register
    const res = await registerUser(formData);
    if (res.success) {
      toast.success('¡Registro exitoso! Revisa tu correo para verificar tu cuenta.', { duration: 5000 });
      reset();
      setPicFile(null);
      setPicPreview('');
      onSwitch();
    } else {
      toast.error(res.error ?? 'Error al registrar');
    }
  };

  const field = 'w-full bg-fp-elevated border border-fp-border text-fp-text placeholder-fp-subtle rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-fp-gold focus:ring-1 focus:ring-fp-gold/50 transition-colors';
  const label = 'block text-xs font-medium text-fp-muted mb-1.5 uppercase tracking-wide';
  const err   = 'text-fp-danger text-xs mt-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
      {/* Profile picture picker */}
      <div className="flex flex-col items-center gap-2 pb-1">
        <div
          onClick={() => picInputRef.current?.click()}
          className="relative w-16 h-16 rounded-full cursor-pointer group"
        >
          {picPreview ? (
            <img src={picPreview} alt="foto" className="w-16 h-16 rounded-full object-cover border-2 border-fp-gold/40" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-fp-elevated border-2 border-dashed border-fp-border flex items-center justify-center">
              <svg className="w-6 h-6 text-fp-border" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <p className="text-fp-subtle text-xs">
          {picPreview ? (
            <button type="button" onClick={() => { setPicFile(null); setPicPreview(''); }}
              className="text-red-400 hover:text-red-500 transition-colors">
              Quitar foto
            </button>
          ) : 'Foto de perfil (opcional)'}
        </p>
        <input
          ref={picInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handlePicChange}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Nombre</label>
          <input className={field} placeholder="Juan" {...register('name', { required: 'Requerido' })} />
          {errors.name && <p className={err}>{errors.name.message}</p>}
        </div>
        <div>
          <label className={label}>Apellido</label>
          <input className={field} placeholder="Pérez" {...register('surname', { required: 'Requerido' })} />
          {errors.surname && <p className={err}>{errors.surname.message}</p>}
        </div>
      </div>

      <div>
        <label className={label}>Usuario</label>
        <input className={field} placeholder="juanperez" {...register('username', { required: 'Requerido' })} />
        {errors.username && <p className={err}>{errors.username.message}</p>}
      </div>

      <div>
        <label className={label}>Email</label>
        <input type="email" className={field} placeholder="correo@ejemplo.com" {...register('email', { required: 'Requerido' })} />
        {errors.email && <p className={err}>{errors.email.message}</p>}
      </div>

      <div>
        <label className={label}>Contraseña</label>
        <input type="password" className={field} placeholder="Mínimo 8 caracteres"
          {...register('password', { required: 'Requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })} />
        {errors.password && <p className={err}>{errors.password.message}</p>}
      </div>

      <div>
        <label className={label}>Confirmar contraseña</label>
        <input type="password" className={field} placeholder="••••••••"
          {...register('confirmPassword', {
            required: 'Requerido',
            validate: (v) => v === password || 'Las contraseñas no coinciden',
          })} />
        {errors.confirmPassword && <p className={err}>{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading || uploadingPic}
        className="w-full bg-fp-gold hover:bg-fp-gold-hover text-fp-bg font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50 mt-1"
      >
        {uploadingPic ? 'Subiendo foto…' : loading ? 'Registrando…' : 'Crear Cuenta'}
      </button>

      <p className="text-center text-fp-subtle text-xs">
        ¿Ya tienes cuenta?{' '}
        <button type="button" onClick={onSwitch} className="text-fp-gold hover:underline font-medium">
          Inicia sesión
        </button>
      </p>
    </form>
  );
};
