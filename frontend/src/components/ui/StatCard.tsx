import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon,
  trend,
  trendPositive,
}) => {
  return (
    <div className="bg-white rounded-xl border border-[#DCE3E3] p-5 shadow-xs flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-[#667477] uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-[#173B3F] mt-1.5">{value}</p>
        {(subtext || trend) && (
          <div className="flex items-center gap-2 mt-1">
            {trend && (
              <span className={`text-xs font-medium ${trendPositive ? 'text-[#4D8061]' : 'text-[#667477]'}`}>
                {trend}
              </span>
            )}
            {subtext && <span className="text-xs text-[#667477]">{subtext}</span>}
          </div>
        )}
      </div>
      <div className="p-2.5 rounded-xl bg-[#DCEDEC]/60 text-[#2E6F73] shrink-0">
        {icon}
      </div>
    </div>
  );
};
