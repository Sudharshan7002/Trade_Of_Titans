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
  let glowBorder = 'border-white/5';
  if (glow === 'cyan') glowBorder = 'border-cyan-500/30 shadow-glow-cyan/20';
  if (glow === 'emerald') glowBorder = 'border-emerald-500/30 shadow-glow-emerald/20';
  if (glow === 'gold') glowBorder = 'border-amber-500/30 shadow-glow-gold/20';
  if (glow === 'crimson') glowBorder = 'border-rose-500/30 shadow-glow-crimson/20';
  if (glow === 'violet') glowBorder = 'border-purple-500/30 shadow-glow-violet/20';

  return (
    <div
      className={`rounded-xl glass-panel ${glowBorder} ${
        hoverEffect ? 'glass-panel-hover' : ''
      } p-5 md:p-6 transition-all duration-300 ${className}`}
    >
      {(title || headerAction || icon) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/40 text-white shrink-0">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="font-display font-bold text-lg text-white truncate">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-400 truncate mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      )}
      <div>{children}</div>
    </div>
  );
};
