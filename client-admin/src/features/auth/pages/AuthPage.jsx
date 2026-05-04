
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm.jsx';
import { ForgotPassword } from '../components/ForgotPassword.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { ResetPasswordForm } from '../components/ResetPasswordForm.jsx';

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const emailParam = searchParams.get('email');
  const tokenParam = searchParams.get('token');
  
  const [view, setView] = useState('login');

  useEffect(() => {
    // Show reset form if there's a token (with or without email)
    if (tokenParam) {
      setView('reset');
    }
  }, [tokenParam]);

  let title = 'Bienvenido de nuevo';
  let subtitle = 'Ingresa a tu cuenta para continuar';
  if (view === 'register') {
    title = 'Crear cuenta';
    subtitle = 'Regístrate para acceder al sistema';
  } else if (view === 'forgot') {
    title = 'Recuperar Contraseña';
    subtitle = 'Ingresa tu correo para recuperar contraseña';
  } else if (view === 'reset') {
    title = 'Nueva Contraseña';
    subtitle = 'Ingresa tu nueva contraseña';
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
      <div className='w-full max-w-xl bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:pd-10'>
        <div className='flex justify-center mb-6'>
          <img
            src='src/assets/img/avatarDefault.png'
            alt='Food Pilot'
            className='h-20 w-auto'
          />
        </div>

        <div className='text-center mb-6'>
          <h1 className='text-2xl lg:text-3xl font-bold text-gray-900 mb-2'>{title}</h1>
          <p className='text-gray-600 text-base max-w-md mx-auto'>{subtitle}</p>
        </div>

        {view === 'reset' ? (
          <ResetPasswordForm email={emailParam} token={tokenParam} onSwitch={() => setView('login')} />
        ) : view === 'forgot' ? (
          <ForgotPassword onSwitch={() => setView('login')} />
        ) : view === 'register' ? (
          <RegisterForm onSwitch={() => setView('login')} />
        ) : (
          <LoginForm
            onForgot={() => setView('forgot')}
            onRegister={() => setView('register')}
          />
        )}
      </div>
    </div>
  );
};
