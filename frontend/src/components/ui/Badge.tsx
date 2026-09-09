import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'teal' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const variantStyles = {
    default: 'bg-[#DCEDEC] text-[#173B3F] border border-[#2E6F73]/20',
    teal: 'bg-[#2E6F73] text-white',
    success: 'bg-[#4D8061]/15 text-[#4D8061] border border-[#4D8061]/30',
    warning: 'bg-[#C98A3D]/15 text-[#C98A3D] border border-[#C98A3D]/30',
    danger: 'bg-[#B94A48]/15 text-[#B94A48] border border-[#B94A48]/30',
    neutral: 'bg-[#F7F8F6] text-[#667477] border border-[#DCE3E3]',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-medium rounded-lg',
  };

  return (
    <span className={`inline-flex items-center gap-1 leading-none ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};
