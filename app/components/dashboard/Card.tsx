import React, { useEffect, useState } from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { CardProps } from '~/types/types';

export const Card: React.FC<CardProps> = ({
  title,
  value,
  icon,
  trend,
  percentage,
  color,
  isCurrency = true
}) => {
  const Icon = icon;
  const [displayedValue, setDisplayedValue] = useState(0);

  useEffect(() => {
    if (value === 0) { setDisplayedValue(0); return; }
    const duration = 1200;
    const startTime = Date.now();
    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedValue(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplayedValue(value);
    };
    const t = setTimeout(() => requestAnimationFrame(animate), 80);
    return () => clearTimeout(t);
  }, [value, title]);

  const iconColors: Record<string, string> = {
    primary: 'bg-[#00216b]/[0.08] text-[#00216b]',
    secondary: 'bg-[#003cc3]/[0.08] text-[#003cc3]',
    success: 'bg-green-50 text-green-600',
    danger: 'bg-red-50 text-red-600',
  };

  return (
    <div className="rounded-md border border-gray-200 bg-white p-4">
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 rounded-md ${iconColors[color] ?? iconColors.primary}`}>
          <Icon size={16} />
        </div>
        {trend && percentage !== undefined && (
          <div className={`flex items-center gap-0.5 text-[11px] font-medium ${percentage > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {percentage > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(percentage)}%
          </div>
        )}
      </div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-gray-500 mb-1">{title}</div>
      <div className="font-mono text-[22px] font-semibold tabular-nums text-gray-900">
        {isCurrency
          ? new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(displayedValue)
          : displayedValue.toLocaleString()}
      </div>
    </div>
  );
};
