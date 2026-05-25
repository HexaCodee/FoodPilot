export const ComingSoon = ({ title, description, icon: Icon }) => {
  return (
    <div className='flex flex-col items-center justify-center min-h-96 gap-5 animate-fadeUp'>
      {Icon && (
        <div className='w-16 h-16 rounded-2xl bg-fp-gold-dim border border-fp-gold/20 flex items-center justify-center'>
          <Icon className='w-7 h-7 text-fp-gold' />
        </div>
      )}
      <div className='text-center'>
        <h2 className='font-display text-2xl text-fp-text mb-2'>{title}</h2>
        <p className='text-fp-muted text-sm max-w-sm'>
          {description ??
            'Esta sección está en desarrollo y estará disponible en la próxima entrega.'}
        </p>
      </div>
      <div className='flex items-center gap-2 px-4 py-2 rounded-full border border-fp-gold/20 bg-fp-gold-dim'>
        <span className='w-2 h-2 rounded-full bg-fp-gold animate-pulse' />
        <span className='text-fp-gold text-xs font-medium tracking-wide'>EN DESARROLLO</span>
      </div>
    </div>
  );
};
