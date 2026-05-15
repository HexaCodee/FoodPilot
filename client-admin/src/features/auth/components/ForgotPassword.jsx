import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { forgotPassword } from '../../../shared/apis';
import toast from 'react-hot-toast';

export const ForgotPassword = ({ onSwitch }) => {
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await forgotPassword(data.email);
      if (res?.status === 200 || res?.data?.success) {
        toast.success('Si el correo existe, recibirás las instrucciones pronto.', { duration: 5000 });
        onSwitch();
      } else {
        toast.error(res?.data?.message ?? 'Error al enviar instrucciones');
      }
    } catch {
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-fp-muted mb-1.5 uppercase tracking-wide">
          Correo electrónico
        </label>
        <input
          type="email"
          placeholder="correo@ejemplo.com"
          className="w-full bg-fp-elevated border border-fp-border text-fp-text placeholder-fp-subtle rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-fp-gold focus:ring-1 focus:ring-fp-gold/50 transition-colors"
          {...register('email', {
            required: 'Este campo es obligatorio',
            pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email inválido' },
          })}
        />
        {errors.email && <p className="text-fp-danger text-xs mt-1">{errors.email.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-fp-gold hover:bg-fp-gold-hover text-fp-bg font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50"
      >
        {loading ? 'Enviando...' : 'Enviar instrucciones'}
      </button>

      <p className="text-center text-fp-subtle text-xs">
        ¿Recordaste tu contraseña?{' '}
        <button type="button" onClick={onSwitch} className="text-fp-gold hover:underline font-medium">
          Iniciar sesión
        </button>
      </p>
    </form>
  );
};
