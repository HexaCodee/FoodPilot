import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useVerifyEmail } from '../hooks/useVerifyEmail';
import logo from '../../../assets/img/avatarDefault.png';

const LoadingSpinner = () => (
  <div className='flex flex-col items-center'>
    <div className='relative'>
      <div className='w-16 h-16 border-4 border-orange-100 rounded-full'></div>
      <div className='absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-orange-500 rounded-full animate-spin'></div>
    </div>
    <p className='mt-4 text-gray-600 font-medium'>Verificando tu correo...</p>
    <p className='text-sm text-gray-400 mt-1'>Por favor espera un momento</p>
  </div>
);

const SuccessState = ({ message }) => (
  <div className='flex flex-col items-center'>
    <div className='relative mb-4'>
      <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center'>
        <svg
          className='w-10 h-10 text-green-500'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='3' d='M5 13l4 4L19 7' />
        </svg>
      </div>
      <div className='absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse'>
        <span className='text-white text-sm'>✓</span>
      </div>
    </div>
    <h2 className='text-xl font-bold text-green-600 mb-2'>¡Correo verificado!</h2>
    <p className='text-gray-600 text-center max-w-xs'>{message}</p>
    <p className='text-sm text-gray-400 mt-3'>Serás redirigido en unos segundos...</p>
  </div>
);

const ErrorState = ({ message }) => (
  <div className='flex flex-col items-center'>
    <div className='w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4'>
      <svg className='w-10 h-10 text-red-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth='2'
          d='M6 18L18 6M6 6l12 12'
        />
      </svg>
    </div>
    <h2 className='text-xl font-bold text-red-600 mb-2'>Error en la verificación</h2>
    <p className='text-gray-600 text-center max-w-xs'>{message}</p>
    <p className='text-sm text-gray-400 mt-3'>Por favor intenta nuevamente o contacta soporte</p>
  </div>
);

export const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const token = new URLSearchParams(location.search).get('token');

  const handleFinish = useCallback(() => {
    setTimeout(() => navigate('/'), 2000);
  }, [navigate]);

  const { status, message } = useVerifyEmail(token, handleFinish);

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 p-4'>
      <div className='w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8'>
        <div className='flex justify-center mb-6'>
          <img src={logo} alt='Food Pilot' className='h-20 w-auto object-contain' />
        </div>

        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold text-gray-900'>Verificación de Correo</h1>
          <p className='text-gray-500 text-sm mt-1'>Food Pilot Admin</p>
        </div>

        <div className='py-4'>
          {status === 'loading' && <LoadingSpinner />}
          {status === 'success' && <SuccessState message={message} />}
          {status === 'error' && <ErrorState message={message} />}
          {status === 'idle' && (
            <div className='flex flex-col items-center'>
              <p className='text-gray-600'>Iniciando verificación...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
