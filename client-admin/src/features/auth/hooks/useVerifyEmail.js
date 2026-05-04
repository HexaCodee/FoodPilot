import { useState, useEffect } from 'react';
import { verifyEmail as verifyEmailRequest } from '../../../shared/apis';
import { showError, showSuccess } from '../../../shared/utils/toast.js';

// Evita múltiples requests en React StrictMode (montaje doble).
const verifyPromiseByToken = new Map();
const verifyResultByToken = new Map();
const toastShownByToken = new Map();
const finishCalledByToken = new Map();

export const useVerifyEmail = (token, onSuccess) => {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let isMounted = true;

    const run = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token inválido.');
        if (!toastShownByToken.get('invalid-token')) {
          showError('Token inválido.');
          toastShownByToken.set('invalid-token', true);
        }
        if (!finishCalledByToken.get('invalid-token')) {
          finishCalledByToken.set('invalid-token', true);
          onSuccess && onSuccess();
        }
        return;
      }

      // Si ya se resolvió previamente, reusar resultado.
      const cached = verifyResultByToken.get(token);
      if (cached) {
        if (!toastShownByToken.get(token)) {
          toastShownByToken.set(token, true);
          cached.status === 'success'
            ? showSuccess('¡Correo verificado correctamente!')
            : showError(cached.message);
        }
        if (!finishCalledByToken.get(token)) {
          finishCalledByToken.set(token, true);
          onSuccess && onSuccess();
        }
        if (isMounted) {
          setStatus(cached.status);
          setMessage(cached.message);
        }
        return;
      }

      // Si ya hay un request en curso para este token, reusar la promesa.
      let promise = verifyPromiseByToken.get(token);
      if (!promise) {
        promise = verifyEmailRequest(token)
          .then((res) => {
            const status = res.status;
            const data = res.data;

            if (status === 0) {
              const errorMessage = 'Error de conexión. Verifica tu internet.';
              verifyResultByToken.set(token, {
                status: 'error',
                message: errorMessage,
              });
              return { status: 'error', message: errorMessage };
            }

            if (status === 200 || data?.success || data?.verified) {
              const successMessage =
                'Tu correo ha sido verificado correctamente. Serás redirigido al login...';
              verifyResultByToken.set(token, {
                status: 'success',
                message: successMessage,
              });
              return { status: 'success', message: successMessage };
            }

            const errorMessage = 'El enlace ha expirado o no es válido.';
            verifyResultByToken.set(token, {
              status: 'error',
              message: errorMessage,
            });
            return { status: 'error', message: errorMessage };
          })
          .catch((err) => {
            const isNetworkError = !err.response;
            const status = err.response?.status;

            let errorMessage;
            if (isNetworkError) {
              errorMessage = 'Error de conexión. Verifica tu internet.';
            } else if (status === 400) {
              errorMessage = 'Token inválido.';
            } else if (status === 404) {
              errorMessage = 'Usuario no encontrado.';
            } else if (status === 410) {
              errorMessage = 'El enlace ha expirado.';
            } else {
              errorMessage = 'El enlace ha expirado o no es válido.';
            }

            verifyResultByToken.set(token, {
              status: 'error',
              message: errorMessage,
            });
            return { status: 'error', message: errorMessage };
          })
          .finally(() => {
            verifyPromiseByToken.delete(token);
          });

        verifyPromiseByToken.set(token, promise);
      }

      const result = await promise;

      if (isMounted) {
        setStatus(result.status);
        setMessage(result.message);
      }

      if (!toastShownByToken.get(token)) {
        toastShownByToken.set(token, true);
        result.status === 'success'
          ? showSuccess('¡Correo verificado correctamente!')
          : showError(result.message);
      }

      if (!finishCalledByToken.get(token)) {
        finishCalledByToken.set(token, true);
        onSuccess && onSuccess();
      }
    };

    run();
    return () => {
      isMounted = false;
    };
  }, [token, onSuccess]);

  return { status, message };
};
