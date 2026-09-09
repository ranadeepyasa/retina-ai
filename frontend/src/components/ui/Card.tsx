import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  action,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-[#DCE3E3] shadow-xs ${onClick ? 'cursor-pointer hover:border-[#2E6F73] transition-colors' : ''} ${className}`}
    >
      {(title || action) && (
        <div className="px-6 py-4 border-b border-[#DCE3E3] flex items-center justify-between">
          <div>
            {typeof title === 'string' ? (
              <h3 className="text-base font-semibold text-[#173B3F]">{title}</h3>
            ) : (
              title
            )}
            {subtitle && <p className="text-xs text-[#667477] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
