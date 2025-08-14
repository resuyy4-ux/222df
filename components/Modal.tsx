import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"></path><path d="m6 6 12 12"></path></svg>
);

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer, size = '2xl' }) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start pt-10 md:pt-16 p-4 transition-opacity duration-300" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div 
        className={`bg-brand-surface text-brand-text-primary rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col transform transition-transform duration-300 scale-95 opacity-0 animate-scale-in border border-brand-border`} 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-brand-border flex-shrink-0">
          <h3 id="modal-title" className="text-xl font-semibold text-brand-text-light">{title}</h3>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text-light p-1 rounded-full hover:bg-brand-input transition-colors" aria-label="Close modal">
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto modal-content-area">
          {children}
        </div>
        {footer && (
            <div className="flex justify-end items-center p-4 bg-brand-bg/50 border-t border-brand-border rounded-b-2xl flex-shrink-0">
                {footer}
            </div>
        )}
      </div>
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in {
          animation: scaleIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Modal;