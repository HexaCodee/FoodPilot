import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

export const RegisterForm = ({ onSwitch }) => {
  const registerUser = useAuthStore((s) => s.register);
  const loading = useAuthStore((s) => s.loading);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (k !== 'confirmPassword') formData.append(k, v); });

    const res = await registerUser(formData);
    if (res.success) {
      toast.success('¡Registro exitoso! Revisa tu correo para verificar tu cuenta.', { duration: 5000 });
      reset();
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
        <input type="password" className={field} placeholder="Mínimo 8 caracteres" {...register('password', { required: 'Requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })} />
        {errors.password && <p className={err}>{errors.password.message}</p>}
      </div>

      <div>
        <label className={label}>Confirmar contraseña</label>
        <input type="password" className={field} placeholder="••••••••" {...register('confirmPassword', {
          required: 'Requerido',
          validate: (v) => v === password || 'Las contraseñas no coinciden',
        })} />
        {errors.confirmPassword && <p className={err}>{errors.confirmPassword.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-fp-gold hover:bg-fp-gold-hover text-fp-bg font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50 mt-1"
      >
        {loading ? 'Registrando...' : 'Crear Cuenta'}
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
