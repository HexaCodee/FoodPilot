import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

export const LoginForm = ({ onForgot, onRegister }) => {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const loading = useAuthStore((s) => s.loading);
  const error = useAuthStore((s) => s.error);

  useEffect(() => {
    useAuthStore.setState({ error: null, loading: false });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const res = await login(data);
    if (res.success) {
      toast.success('¡Bienvenido!', { duration: 1800 });
      navigate(res.dashboardPath, { replace: true });
    } else {
      toast.error(res.error ?? 'Error al iniciar sesión');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <div>
        <label className='block text-xs font-medium text-fp-muted mb-1.5 uppercase tracking-wide'>
          Email o Usuario
        </label>
        <input
          type='text'
          placeholder='correo@ejemplo.com'
          className='w-full bg-fp-elevated border border-fp-border text-fp-text placeholder-fp-subtle rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-fp-gold focus:ring-1 focus:ring-fp-gold/50 transition-colors'
          {...register('emailOrUsername', { required: 'Este campo es obligatorio' })}
        />
        {errors.emailOrUsername && (
          <p className='text-fp-danger text-xs mt-1'>{errors.emailOrUsername.message}</p>
        )}
      </div>

      <div>
        <label className='block text-xs font-medium text-fp-muted mb-1.5 uppercase tracking-wide'>
          Contraseña
        </label>
        <input
          type='password'
          placeholder='••••••••'
          className='w-full bg-fp-elevated border border-fp-border text-fp-text placeholder-fp-subtle rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:border-fp-gold focus:ring-1 focus:ring-fp-gold/50 transition-colors'
          {...register('password', { required: 'Este campo es obligatorio' })}
        />
        {errors.password && (
          <p className='text-fp-danger text-xs mt-1'>{errors.password.message}</p>
        )}
      </div>

      {error && (
        <p className='text-fp-danger text-sm text-center bg-fp-danger-dim border border-fp-danger/20 rounded-lg px-3 py-2'>
          {error}
        </p>
      )}

      <button
        type='submit'
        disabled={loading}
        className='w-full bg-fp-gold hover:bg-fp-gold-hover text-fp-bg font-semibold py-2.5 rounded-lg transition-colors duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed mt-1'
      >
        {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
      </button>

      <div className='flex flex-col gap-1.5 text-center text-sm pt-1'>
        <button
          type='button'
          onClick={onForgot}
          className='text-fp-muted hover:text-fp-gold transition-colors text-xs'
        >
          ¿Olvidaste tu contraseña?
        </button>
        <span className='text-fp-subtle text-xs'>
          ¿No tienes cuenta?{' '}
          <button
            type='button'
            onClick={onRegister}
            className='text-fp-gold hover:underline font-medium'
          >
            Regístrate aquí
          </button>
        </span>
      </div>
    </form>
  );
};
