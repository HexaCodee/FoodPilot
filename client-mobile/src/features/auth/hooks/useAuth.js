// client-mobile/src/features/auth/hooks/useAuth.js
import { useState, useCallback } from 'react';
import {
  login as loginRequest,
  register as registerRequest,
} from '../../../shared/api/authClient.js';
import { useAuthStore } from '../../../shared/store/authStore.js';

// Si `err.response` no existe, la petición nunca llegó a obtener respuesta del
// servidor (timeout, sin red, host/puerto inalcanzable, CORS, etc.). En ese
// caso NO hay que mostrar el `fallback` de "credenciales inválidas" — eso
// confunde al usuario haciéndole creer que su usuario/contraseña está mal
// cuando en realidad la app no pudo ni hablar con el backend.
const extractErrorMessage = (err, fallback) => {
  if (!err?.response) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet y que los servicios estén disponibles.';
  }
  return err.response.data?.message ?? err.response.data?.error ?? fallback;
};

export const useAuth = () => {
  const { login: setSession, logout: clearSession, user, isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Login ─────────────────────────────────────────────────────────────────
  // Backend (AuthService.cs / AuthController) responde con:
  //   { token, userDetails: { id, username, profilePicture, role }, expiresAt, refreshToken? }
  // Se tolera también { accessToken, user } por si el shape cambia.
  const handleLogin = useCallback(async (emailOrUsername, password) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await loginRequest(emailOrUsername, password);

      const accessToken = data.token ?? data.accessToken;
      const userDetails = data.userDetails ?? data.user ?? null;
      const refreshToken = data.refreshToken ?? null;

      await setSession(accessToken, userDetails, refreshToken);
      return { ok: true };
    } catch (err) {
      const msg = extractErrorMessage(err, 'Credenciales inválidas. Intenta de nuevo.');
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, [setSession]);

  // ── Registro ──────────────────────────────────────────────────────────────
  // formData: FormData (name, surname, username, email, phone, password)
  const handleRegister = useCallback(async (formData) => {
    setLoading(true);
    setError('');
    try {
      await registerRequest(formData);
      return { ok: true };
    } catch (err) {
      const msg = extractErrorMessage(err, 'Error al crear la cuenta. Intenta de nuevo.');
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await clearSession();
  }, [clearSession]);

  return {
    user,
    isAuthenticated,
    handleLogin,
    handleRegister,
    logout,
    loading,
    error,
    clearError: () => setError(''),
  };
};
