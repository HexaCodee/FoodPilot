import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { LoginForm } from '../components/LoginForm.jsx';
import { ForgotPassword } from '../components/ForgotPassword.jsx';
import { RegisterForm } from '../components/RegisterForm.jsx';
import { ResetPasswordForm } from '../components/ResetPasswordForm.jsx';

const VIEWS = {
  login:    { title: 'Bienvenido de nuevo',    subtitle: 'Accede a tu cuenta para continuar' },
  register: { title: 'Crear cuenta',           subtitle: 'Únete a la plataforma FoodPilot' },
  forgot:   { title: 'Recuperar contraseña',   subtitle: 'Te enviaremos un enlace a tu correo' },
  reset:    { title: 'Nueva contraseña',       subtitle: 'Elige una contraseña segura' },
};

export const AuthPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenParam = searchParams.get('token');
  const { isAuthenticated, getDashboardPath, isLoadingAuth } = useAuthStore();

  const [view, setView] = useState('login');

  useEffect(() => {
    if (tokenParam) setView('reset');
  }, [tokenParam]);

  useEffect(() => {
    if (!isLoadingAuth && isAuthenticated) {
      navigate(getDashboardPath(), { replace: true });
    }
  }, [isAuthenticated, isLoadingAuth, navigate, getDashboardPath]);

  const { title, subtitle } = VIEWS[view];

  return (
    <div className="min-h-screen bg-fp-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-fp-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-fp-gold/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative animate-fadeIn">
        {/* Card */}
        <div className="bg-fp-surface border border-fp-border rounded-2xl shadow-2xl overflow-hidden">
          {/* Gold top accent */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-fp-gold to-transparent" />

          <div className="px-8 py-8">
            {/* Brand */}
            <div className="text-center mb-7">
              <h1 className="font-display text-3xl text-fp-gold mb-0.5 tracking-wide">FoodPilot</h1>
              <div className="gold-divider mx-auto w-16 mt-2 mb-5" />
              <h2 className="text-fp-text text-lg font-semibold">{title}</h2>
              <p className="text-fp-muted text-sm mt-1">{subtitle}</p>
            </div>

            {/* Forms */}
            {view === 'reset'    && <ResetPasswordForm token={tokenParam} onSwitch={() => setView('login')} />}
            {view === 'forgot'   && <ForgotPassword onSwitch={() => setView('login')} />}
            {view === 'register' && <RegisterForm onSwitch={() => setView('login')} />}
            {view === 'login'    && (
              <LoginForm onForgot={() => setView('forgot')} onRegister={() => setView('register')} />
            )}
          </div>
        </div>

        <p className="text-center text-fp-subtle text-xs mt-5">
          © {new Date().getFullYear()} FoodPilot · Plataforma de gestión de restaurantes
        </p>
      </div>
    </div>
  );
};
