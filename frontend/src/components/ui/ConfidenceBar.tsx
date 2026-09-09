import React from 'react';

interface ConfidenceBarProps {
  confidence: number; // 0.0 to 1.0 or 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const ConfidenceBar: React.FC<ConfidenceBarProps> = ({
  confidence,
  showLabel = true,
  size = 'md',
  className = '',
}) => {
  const percent = confidence <= 1.0 ? Math.round(confidence * 100) : Math.round(confidence);

  const getBarColor = (val: number) => {
    if (val >= 85) return 'bg-[#2E6F73]';
    if (val >= 65) return 'bg-[#C98A3D]';
    return 'bg-[#B94A48]';
  };

  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="text-[#667477]">Model Confidence</span>
          <span className="font-semibold text-[#173B3F]">{percent}%</span>
        </div>
      )}
      <div className={`w-full bg-[#DCE3E3]/60 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} rounded-full transition-all duration-500 ${getBarColor(percent)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
