import { useEffect } from 'react';
import { CloseIcon } from './Icons.jsx';

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' onClick={onClose} />

      {/* Panel */}
      <div
        className={`relative w-full ${maxWidth} bg-fp-surface border border-fp-border rounded-2xl shadow-2xl animate-fadeUp`}
      >
        {/* Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-fp-border'>
          <h2 className='font-display text-lg text-fp-text'>{title}</h2>
          <button
            onClick={onClose}
            className='p-1.5 rounded-lg text-fp-muted hover:text-fp-text hover:bg-fp-bg transition-colors'
          >
            <CloseIcon className='w-4 h-4' />
          </button>
        </div>

        {/* Body */}
        <div className='px-6 py-5'>{children}</div>
      </div>
    </div>
  );
};

export const ModalActions = ({ children }) => (
  <div className='flex justify-end gap-3 pt-4 border-t border-fp-border mt-4'>{children}</div>
);

export const BtnSecondary = ({ onClick, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className='px-4 py-2 rounded-lg border border-fp-border text-fp-muted hover:text-fp-text hover:border-fp-gold/30 transition-colors text-sm disabled:opacity-50'
  >
    {children}
  </button>
);

export const BtnPrimary = ({ onClick, children, disabled, loading, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className='px-4 py-2 rounded-lg bg-fp-gold text-fp-bg font-medium hover:bg-fp-gold-hover transition-colors text-sm disabled:opacity-50 flex items-center gap-2'
  >
    {loading && (
      <svg className='animate-spin w-3.5 h-3.5' viewBox='0 0 24 24' fill='none'>
        <circle
          className='opacity-25'
          cx='12'
          cy='12'
          r='10'
          stroke='currentColor'
          strokeWidth='4'
        />
        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8v8H4z' />
      </svg>
    )}
    {children}
  </button>
);
