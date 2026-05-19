import { useAuthStore } from '../../auth/store/authStore.js';
import { UserIcon } from '../../../shared/components/ui/Icons.jsx';

const ROLE_LABEL = {
  CLIENT:           'Cliente',
  RESTAURANT_ADMIN: 'Admin Restaurante',
  PLATFORM_ADMIN:   'Admin Plataforma',
};

const ROLE_STYLE = {
  CLIENT:           'bg-blue-400/10   text-blue-400',
  RESTAURANT_ADMIN: 'bg-fp-gold-dim   text-fp-gold',
  PLATFORM_ADMIN:   'bg-purple-400/10 text-purple-400',
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-center justify-between py-3 border-b border-fp-border-subtle last:border-0">
    <span className="text-fp-subtle text-sm">{label}</span>
    <span className="text-fp-text text-sm font-medium">{value ?? '—'}</span>
  </div>
);

export const ProfilePage = () => {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6 animate-fadeUp max-w-lg">
      <div>
        <h1 className="font-display text-2xl text-fp-text">Mi Perfil</h1>
        <p className="text-fp-muted text-sm mt-0.5">Información de tu cuenta</p>
      </div>

      {/* Avatar + name */}
      <div className="bg-fp-surface border border-fp-border rounded-xl p-6 flex items-center gap-5">
        {user?.profilePicture ? (
          <img
            src={user.profilePicture}
            alt={user.username}
            className="w-16 h-16 rounded-full object-cover border-2 border-fp-gold/30"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-fp-gold-dim border-2 border-fp-gold/20 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-8 h-8 text-fp-gold" />
          </div>
        )}
        <div>
          <p className="text-fp-text text-lg font-semibold">{user?.username ?? '—'}</p>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium mt-1 inline-block ${ROLE_STYLE[user?.role] ?? ROLE_STYLE.CLIENT}`}>
            {ROLE_LABEL[user?.role] ?? user?.role ?? '—'}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="bg-fp-surface border border-fp-border rounded-xl p-5">
        <h3 className="text-fp-text font-medium text-sm mb-3">Detalles de la cuenta</h3>
        <InfoRow label="Nombre de usuario" value={user?.username} />
        <InfoRow label="Rol"               value={ROLE_LABEL[user?.role] ?? user?.role} />
        <InfoRow label="ID de cuenta"      value={user?.id ? `…${user.id.slice(-8)}` : null} />
      </div>

      {/* Note */}
      <p className="text-fp-subtle text-xs text-center">
        Para actualizar tu información contacta al administrador de la plataforma.
      </p>
    </div>
  );
};
