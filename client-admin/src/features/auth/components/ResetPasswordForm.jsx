import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { resetPassword } from '../../../shared/apis';
import toast from 'react-hot-toast';

export const ResetPasswordForm = ({ email, token, onSwitch }) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    if (!token) {
      toast.error('Token de recuperación inválido');
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPassword(token, data.newPassword);
      if (res?.status === 200 || res?.data?.success) {
        toast.success('Contraseña actualizada correctamente', { duration: 4000 });
        setTimeout(() => {
          onSwitch();
        }, 2000);
      } else {
        const errorMsg = res?.data?.message || 'Error al actualizar la contraseña';
        toast.error(errorMsg);
      }
    } catch (err) {
      const errorMsg = err?.response?.data?.message || 'Error al conectar con el servidor';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      {email && (
        <div>
          <label htmlFor='email' className='block text-sm font-medium text-gray-800 mb-1.5'>
            Email
          </label>
          <input
            type='email'
            id='email'
            disabled
            value={email}
            className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100'
          />
        </div>
      )}

      <div>
        <label htmlFor='newPassword' className='block text-sm font-medium text-gray-800 mb-1.5'>
          Nueva Contraseña
        </label>

        <input
          type='password'
          id='newPassword'
          placeholder='********'
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          {...register('newPassword', {
            required: 'Este campo es obligatorio',
            minLength: {
              value: 8,
              message: 'Mínimo 8 caracteres',
            },
          })}
        />

        {errors.newPassword && <p className='text-red-600 text-xs mt-1'>{errors.newPassword.message}</p>}
      </div>

      <div>
        <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-800 mb-1.5'>
          Confirmar Contraseña
        </label>

        <input
          type='password'
          id='confirmPassword'
          placeholder='********'
          className='w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500'
          {...register('confirmPassword', {
            required: 'Este campo es obligatorio',
            minLength: {
              value: 8,
              message: 'Mínimo 8 caracteres',
            },
          })}
        />

        {errors.confirmPassword && <p className='text-red-600 text-xs mt-1'>{errors.confirmPassword.message}</p>}
      </div>

      <button
        type='submit'
        disabled={isLoading}
        className='w-full bg-main-blue hover:opacity-90 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 text-sm disabled:opacity-60'
      >
        {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
      </button>
      <p className='text-center text-sm'>
        ¿Recordaste tu contraseña?{' '}
        <button
          type='button'
          onClick={onSwitch}
          className='text-main-blue hover:underline hover:cursor-pointer'
        >
          Iniciar Sesión
        </button>
      </p>
    </form>
  );
};