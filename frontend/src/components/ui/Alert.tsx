import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger';
  title?: string;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  className = '',
}) => {
  const configs = {
    info: {
      bg: 'bg-[#DCEDEC]/50 border-[#2E6F73]/30 text-[#173B3F]',
      icon: <Info className="w-4 h-4 text-[#2E6F73] shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-[#4D8061]/10 border-[#4D8061]/30 text-[#173B3F]',
      icon: <CheckCircle2 className="w-4 h-4 text-[#4D8061] shrink-0 mt-0.5" />,
    },
    warning: {
      bg: 'bg-[#C98A3D]/10 border-[#C98A3D]/30 text-[#173B3F]',
      icon: <AlertTriangle className="w-4 h-4 text-[#C98A3D] shrink-0 mt-0.5" />,
    },
    danger: {
      bg: 'bg-[#B94A48]/10 border-[#B94A48]/30 text-[#B94A48]',
      icon: <AlertCircle className="w-4 h-4 text-[#B94A48] shrink-0 mt-0.5" />,
    },
  };

  const cfg = configs[variant];

  return (
    <div className={`p-3.5 rounded-xl border flex gap-3 text-xs leading-relaxed ${cfg.bg} ${className}`}>
      {cfg.icon}
      <div className="flex-1">
        {title && <h4 className="font-semibold mb-0.5">{title}</h4>}
        <div>{children}</div>
      </div>
    </div>
  );
};
