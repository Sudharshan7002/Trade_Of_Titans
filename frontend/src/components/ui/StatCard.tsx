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
  const style = { border: 'border-purple-500/40 hover:border-purple-400', iconBg: 'bg-purple-500/20 text-white border-purple-400/40' };

  return (
    <div
      className={`glass-panel p-5 rounded-xl border ${style.border} transition-colors relative group`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</span>
        {icon && (
          <div className={`p-2.5 rounded-xl border ${style.iconBg} shrink-0 transition-transform group-hover:scale-110`}>
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="font-display font-black text-2xl sm:text-3xl text-white tracking-tight">
          {value}
        </div>
        {action && <div>{action}</div>}
      </div>

      {(subtitle || trend) && (
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5 text-xs text-slate-400">
          {trend && (
            <span
              className={`font-semibold ${
                trendPositive ? 'text-emerald-400' : 'text-rose-400'
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
