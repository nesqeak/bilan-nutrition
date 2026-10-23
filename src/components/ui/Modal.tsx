import { useEffect, useRef, type ReactNode } from 'react';

interface ModalProps {
  title: string;
  onClose: () => void;
  /** Classes du panneau (largeur, fond...). */
  className?: string;
  children: ReactNode;
}

/**
 * Fenêtre modale plein écran. Elle doit rester un enfant direct de la racine de l'application :
 * la feuille de style d'impression s'appuie sur cette structure (#root > div > div.fixed).
 */
export function Modal({ title, onClose, className = 'max-w-md', children }: ModalProps) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onCloseRef.current();
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4"
    >
      <div className={`w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden ${className}`}>
        {children}
      </div>
    </div>
  );
}
