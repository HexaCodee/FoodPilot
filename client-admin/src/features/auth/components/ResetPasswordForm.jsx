import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { resetPassword } from '../../../shared/apis';
import toast from 'react-hot-toast';

export const ResetPasswordForm = ({ token, onSwitch }) => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const password = watch('newPassword');

  const onSubmit = async (data) => {
    if (!token) { toast.error('Token inválido o expirado'); return; }
    setLoading(true);
    try {
      const res = await resetPassword(token, data.newPassword);
      if (res?.status === 200 || res?.data?.success) {
        toast.success('¡Contraseña actualizada! Ya puedes iniciar sesión.', { duration: 4000 });
        setTimeout(onSwitch, 2000);
      } else {
        toast.error(res?.data?.message ?? 'Error al actualizar la contraseña');
      }
    } catch {
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const field = 'w-full bg-fp-elevated border border-fp-border text-fp-text placeholder-fp-subtle rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-fp-gold focus:ring-1 focus:ring-fp-gold/50 transition-colors';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-fp-muted mb-1.5 uppercase tracking-wide">
          Nueva contraseña
        </label>
        <input type="password" className={field} placeholder="Mínimo 8 caracteres"
          {...register('newPassword', { required: 'Requerido', minLength: { value: 8, message: 'Mínimo 8 caracteres' } })} />
        {errors.newPassword && <p className="text-fp-danger text-xs mt-1">{errors.newPassword.message}</p>}
      </div>

      <div>
        <label className="block text-xs font-medium text-fp-muted mb-1.5 uppercase tracking-wide">
          Confirmar contraseña
        </label>
        <input type="password" className={field} placeholder="••••••••"
          {...register('confirmPassword', {
            required: 'Requerido',
            validate: (v) => v === password || 'Las contraseñas no coinciden',
          })} />
        {errors.confirmPassword && <p className="text-fp-danger text-xs mt-1">{errors.confirmPassword.message}</p>}
      </div>

      <button type="submit" disabled={loading}
        className="w-full bg-fp-gold hover:bg-fp-gold-hover text-fp-bg font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50">
        {loading ? 'Actualizando...' : 'Actualizar contraseña'}
      </button>

      <p className="text-center text-fp-subtle text-xs">
        <button type="button" onClick={onSwitch} className="text-fp-gold hover:underline font-medium">
          Volver al inicio de sesión
        </button>
      </p>
    </form>
  );
};
