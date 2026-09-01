import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number | React.ReactNode;
  icon?: React.ReactNode;
  trend?: string;
  trendPositive?: boolean;
  accentColor?: 'cyan' | 'emerald' | 'gold' | 'crimson' | 'violet';
  subtitle?: string;
  action?: React.ReactNode;
}

const colorStyles = {
  cyan: {
    icon: 'bg-black text-[#CCFF00] dark:bg-[#CCFF00]/15 dark:text-[#CCFF00] border-black/10 dark:border-[#CCFF00]/30',
    dot: 'bg-[#CCFF00]',
  },
  emerald: {
    icon: 'bg-[#CCFF00]/20 text-black dark:bg-[#CCFF00]/15 dark:text-[#CCFF00] border-[#CCFF00]/40 dark:border-[#CCFF00]/30',
    dot: 'bg-[#CCFF00]',
  },
  gold: {
    icon: 'bg-[#FFD000]/15 text-[#B38F00] dark:bg-[#FFD000]/15 dark:text-[#FFD000] border-[#FFD000]/30',
    dot: 'bg-[#FFD000]',
  },
  crimson: {
    icon: 'bg-[#FF5533]/15 text-[#FF5533] dark:bg-[#FF5533]/20 dark:text-[#FF5533] border-[#FF5533]/30',
    dot: 'bg-[#FF5533]',
  },
  violet: {
    icon: 'bg-[#B026FF]/15 text-[#B026FF] dark:bg-[#B026FF]/20 dark:text-[#B026FF] border-[#B026FF]/30',
    dot: 'bg-[#B026FF]',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  trend,
  trendPositive = true,
  accentColor = 'cyan',
  subtitle,
  action,
}) => {
  const theme = colorStyles[accentColor] || colorStyles.cyan;

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 relative group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          // {label}
        </span>
        {icon && (
          <div
            className={`p-2.5 rounded-2xl border ${theme.icon} shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-sm`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="font-display font-black text-2xl sm:text-3xl text-black dark:text-white tracking-tight">
          {value}
        </div>
        {action && <div>{action}</div>}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-neutral-100 dark:border-white/5 text-xs text-neutral-500 dark:text-neutral-400">
          {trend && (
            <span
              className={`font-display font-bold ${
                trendPositive ? 'text-[#16a34a] dark:text-[#CCFF00]' : 'text-[#FF5533]'
              }`}
            >
              {trend}
            </span>
          )}
          {subtitle && <span className="truncate">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
