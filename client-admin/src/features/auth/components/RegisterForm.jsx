import { useForm } from 'react-hook-form';
import { useAuthStore } from '../store/authStore.js';
import toast from 'react-hot-toast';

export const RegisterForm = ({ onSwitch }) => {
  const registerUser = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    const res = await registerUser(data);
    if (res.success) {
      toast.success('¡Registro exitoso! Revisa tu correo para verificar tu cuenta.', {
        duration: 4000,
      });
      reset();
      onSwitch();
    } else {
      toast.error(res.error || 'Error al registrar');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <div>
        <label htmlFor='username' className='block text-sm font-medium text-gray-800 mb-1.5'>
          Username
        </label>
        <input
          type='text'
          id='username'
          placeholder='Tu nombre de usuario'
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          {...register('username', { required: 'Este campo es obligatorio' })}
        />
        {errors.username && <p className='text-red-600 text-xs mt-1'>{errors.username.message}</p>}
      </div>
      <div>
        <label htmlFor='email' className='block text-sm font-medium text-gray-800 mb-1.5'>
          Email
        </label>
        <input
          type='email'
          id='email'
          placeholder='correo@example.com'
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          {...register('email', { required: 'Este campo es obligatorio' })}
        />
        {errors.email && <p className='text-red-600 text-xs mt-1'>{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor='password' className='block text-sm font-medium text-gray-800 mb-1.5'>
          Contraseña
        </label>
        <input
          type='password'
          id='password'
          placeholder='********'
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          {...register('password', {
            required: 'Este campo es obligatorio',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
          })}
        />
        {errors.password && <p className='text-red-600 text-xs mt-1'>{errors.password.message}</p>}
      </div>
      <button
        type='submit'
        className='w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60'
        disabled={loading}
      >
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
      <p className='text-sm text-center mt-2'>
        ¿Ya tienes cuenta?{' '}
        <button type='button' className='text-blue-600 hover:underline' onClick={onSwitch}>
          Inicia sesión
        </button>
      </p>
      {error && <p className='text-red-600 text-xs mt-2 text-center'>{error}</p>}
    </form>
  );
};
