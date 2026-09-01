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
  let glowBorder = 'border-neutral-200/90 dark:border-white/10';
  if (glow === 'cyan' || glow === 'emerald') glowBorder = 'border-[#CCFF00]/40 shadow-[0_0_20px_rgba(204,255,0,0.15)]';
  if (glow === 'gold') glowBorder = 'border-[#FFD000]/40 shadow-[0_0_20px_rgba(255,208,0,0.15)]';
  if (glow === 'crimson') glowBorder = 'border-[#FF5533]/40 shadow-[0_0_20px_rgba(255,85,51,0.15)]';
  if (glow === 'violet') glowBorder = 'border-[#B026FF]/40 shadow-[0_0_20px_rgba(176,38,255,0.15)]';

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#111111] border ${glowBorder} ${
        hoverEffect ? 'hover:shadow-lg hover:-translate-y-1' : 'shadow-sm'
      } p-5 sm:p-6 transition-all duration-200 ${className}`}
    >
      {(title || headerAction || icon) && (
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100 dark:border-white/5 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {icon && (
              <div className="p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-black dark:text-[#CCFF00] shrink-0 shadow-sm">
                {icon}
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="font-display font-bold text-lg text-black dark:text-white truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate mt-0.5 font-mono">
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
