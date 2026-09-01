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
    icon: 'bg-sky-50 dark:bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-200/60 dark:border-sky-500/30',
    dot: 'bg-sky-500',
  },
  emerald: {
    icon: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  gold: {
    icon: 'bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-200/60 dark:border-amber-500/30',
    dot: 'bg-amber-500',
  },
  crimson: {
    icon: 'bg-rose-50 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/30',
    dot: 'bg-rose-500',
  },
  violet: {
    icon: 'bg-purple-50 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-200/60 dark:border-purple-500/30',
    dot: 'bg-purple-500',
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
    <div className="p-5 rounded-2xl bg-white dark:bg-titan-900 border border-slate-200/80 dark:border-white/10 shadow-soft-card hover:shadow-soft-card-hover transition-all duration-200 relative group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {icon && (
          <div
            className={`p-2.5 rounded-xl border ${theme.icon} shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-sm`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="font-display font-black text-2xl sm:text-3xl text-slate-950 dark:text-white tracking-tight">
          {value}
        </div>
        {action && <div>{action}</div>}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100 dark:border-white/5 text-xs text-slate-500 dark:text-slate-400">
          {trend && (
            <span
              className={`font-semibold ${
                trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
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
