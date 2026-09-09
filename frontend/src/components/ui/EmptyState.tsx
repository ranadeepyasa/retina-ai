import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-[#DCE3E3] bg-[#F7F8F6]/50">
      {icon && (
        <div className="w-12 h-12 rounded-xl bg-[#DCEDEC]/50 text-[#2E6F73] flex items-center justify-center mx-auto mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-sm font-semibold text-[#173B3F]">{title}</h3>
      <p className="text-xs text-[#667477] max-w-sm mx-auto mt-1 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};
