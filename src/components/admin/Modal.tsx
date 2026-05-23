import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon,
  children,
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4 animate-in fade-in duration-200">
      {/* 1. Backdrop Blur Overlay */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-navy-dark/60 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* 2. Responsive Modal Container (Full-screen on mobile, centered card on desktop) */}
      <div className="relative bg-white shadow-2xl w-full h-full md:h-auto md:max-h-[90vh] md:max-w-lg md:rounded-2xl border border-navy-dark/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-250 z-10">
        
        {/* Header Strip */}
        <div className="bg-navy-dark text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center space-x-2.5">
            {icon && <div className="text-orange-burnt shrink-0">{icon}</div>}
            <h3 className="font-display font-extrabold text-base tracking-wide uppercase">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors outline-none focus:ring-1 focus:ring-orange-burnt"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body Pane */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 bg-gray-50/30">
          {children}
        </div>

      </div>
    </div>
  );
};

export default Modal;
