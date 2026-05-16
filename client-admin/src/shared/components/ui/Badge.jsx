const ROLE_MAP = {
  PLATFORM_ADMIN:   { label: 'Admin Plataforma', cls: 'bg-purple-900/40 text-purple-300 border-purple-700/40' },
  RESTAURANT_ADMIN: { label: 'Admin Restaurante', cls: 'bg-blue-900/40 text-blue-300 border-blue-700/40' },
  CLIENT:           { label: 'Cliente',            cls: 'bg-fp-gold-dim text-fp-gold border-fp-gold/30' },
};

const STATUS_MAP = {
  active:   { label: 'Activo',    cls: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40' },
  inactive: { label: 'Inactivo',  cls: 'bg-red-900/40 text-red-400 border-red-700/40' },
  verified: { label: 'Verificado',cls: 'bg-emerald-900/40 text-emerald-400 border-emerald-700/40' },
  pending:  { label: 'Pendiente', cls: 'bg-amber-900/40 text-amber-400 border-amber-700/40' },
};

export const RoleBadge = ({ role }) => {
  const { label, cls } = ROLE_MAP[role] ?? { label: role, cls: 'bg-fp-surface text-fp-muted border-fp-border' };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
};

export const StatusBadge = ({ active }) => {
  const key = active ? 'active' : 'inactive';
  const { label, cls } = STATUS_MAP[key];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-400' : 'bg-red-400'}`} />
      {label}
    </span>
  );
};

export const EmailBadge = ({ verified }) => {
  const key = verified ? 'verified' : 'pending';
  const { label, cls } = STATUS_MAP[key];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${cls}`}>
      {label}
    </span>
  );
};
