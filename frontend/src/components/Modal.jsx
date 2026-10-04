import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, children, width = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/40 p-4 pt-[8vh] backdrop-blur-[2px]">
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${width} animate-[modalIn_150ms_ease-out] rounded-card bg-paper-card shadow-lift`}
      >
        {children}
      </div>
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(6px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}

export function ModalHeader({ title, onClose }) {
  return (
    <div className="flex items-center justify-between border-b border-paper-line px-5 py-4">
      <h2 className="font-display text-lg text-ink">{title}</h2>
      <button
        onClick={onClose}
        className="rounded-md p-1 text-ink-soft transition hover:bg-paper hover:text-ink"
        aria-label="Close"
      >
        <X size={18} />
      </button>
    </div>
  );
}
