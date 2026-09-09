import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg',
}) => {
  if (!isOpen) return null;

  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className={`bg-white rounded-2xl shadow-xl w-full ${maxWidthStyles[maxWidth]} border border-[#DCE3E3] overflow-hidden animate-in fade-in zoom-in-95 duration-150`}>
        <div className="px-6 py-4 border-b border-[#DCE3E3] flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#173B3F]">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#667477] hover:text-[#172326] hover:bg-[#F7F8F6] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
