import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  const { getDashboardPath, isAuthenticated, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-fp-bg flex items-center justify-center p-4">
      <div className="text-center animate-fadeIn">
        <p className="text-fp-gold font-display text-8xl font-bold opacity-20 select-none">403</p>
        <h1 className="font-display text-2xl text-fp-text mt-2 mb-2">Acceso denegado</h1>
        <p className="text-fp-muted text-sm mb-8 max-w-xs mx-auto">
          No tienes permiso para acceder a esta sección.
        </p>
        <div className="flex gap-3 justify-center">
          {isAuthenticated ? (
            <button
              onClick={() => navigate(getDashboardPath())}
              className="bg-fp-gold hover:bg-fp-gold-hover text-fp-bg font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Ir a mi panel
            </button>
          ) : (
            <button
              onClick={() => navigate('/')}
              className="bg-fp-gold hover:bg-fp-gold-hover text-fp-bg font-semibold px-5 py-2.5 rounded-lg transition-colors text-sm"
            >
              Iniciar sesión
            </button>
          )}
          <button
            onClick={logout}
            className="border border-fp-border text-fp-muted hover:text-fp-text hover:border-fp-muted px-5 py-2.5 rounded-lg transition-colors text-sm"
          >
            Salir
          </button>
        </div>
      </div>
    </div>
  );
};
