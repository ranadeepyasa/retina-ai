import React from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

interface SeverityBadgeProps {
  severity: number; // 0 to 4
  showStage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  severity,
  showStage = true,
  size = 'md',
  className = '',
}) => {
  const { t } = useTranslation();
  const configs = [
    {
      label: 'No Diabetic Retinopathy',
      stage: 'Stage 0',
      bg: 'bg-[#4D8061]/10 text-[#4D8061] border-[#4D8061]/30',
      icon: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      label: 'Mild NPDR',
      stage: 'Stage 1',
      bg: 'bg-[#2E6F73]/10 text-[#2E6F73] border-[#2E6F73]/30',
      icon: <AlertCircle className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      label: 'Moderate NPDR',
      stage: 'Stage 2',
      bg: 'bg-[#C98A3D]/10 text-[#C98A3D] border-[#C98A3D]/30',
      icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      label: 'Severe NPDR',
      stage: 'Stage 3',
      bg: 'bg-[#B58A5A]/20 text-[#8F5B25] border-[#B58A5A]/40',
      icon: <AlertTriangle className="w-3.5 h-3.5 shrink-0" />,
    },
    {
      label: 'Proliferative DR',
      stage: 'Stage 4',
      bg: 'bg-[#B94A48]/10 text-[#B94A48] border-[#B94A48]/30',
      icon: <ShieldAlert className="w-3.5 h-3.5 shrink-0" />,
    },
  ];

  const validSeverity = Math.min(Math.max(severity, 0), 4);
  const cfg = configs[validSeverity];
  const translatedLabel = t(`severity.${validSeverity}`, cfg.label);

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5 rounded-md gap-1',
    md: 'text-xs px-2.5 py-1 rounded-lg gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 rounded-xl gap-2 font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center border ${cfg.bg} ${sizeStyles[size]} ${className}`}
      title={translatedLabel}
    >
      {cfg.icon}
      {showStage && <span className="opacity-75">{cfg.stage}:</span>}
      <span>{translatedLabel}</span>
    </span>
  );
};
