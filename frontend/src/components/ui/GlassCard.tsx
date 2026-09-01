import React from 'react';

interface GlassCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'emerald' | 'gold' | 'crimson' | 'violet' | 'none';
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  title,
  subtitle,
  icon,
  headerAction,
  children,
  className = '',
  glow = 'none',
  hoverEffect = false,
}) => {
  let glowBorder = 'border-slate-200/80 dark:border-white/10';
  if (glow === 'cyan') glowBorder = 'border-sky-300 dark:border-sky-500/30 shadow-glow-cyan/20';
  if (glow === 'emerald') glowBorder = 'border-emerald-300 dark:border-emerald-500/30 shadow-glow-emerald/20';
  if (glow === 'gold') glowBorder = 'border-amber-300 dark:border-amber-500/30 shadow-glow-gold/20';
  if (glow === 'crimson') glowBorder = 'border-rose-300 dark:border-rose-500/30 shadow-glow-rose/20';
  if (glow === 'violet') glowBorder = 'border-purple-300 dark:border-purple-500/30';

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-titan-900 border ${glowBorder} ${
        hoverEffect ? 'hover:shadow-soft-card-hover hover:-translate-y-0.5' : ''
      } shadow-soft-card p-5 md:p-6 transition-all duration-200 ${className}`}
    >
      {(title || headerAction || icon) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-white/5 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-white/10 text-slate-800 dark:text-white shrink-0 shadow-sm">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
