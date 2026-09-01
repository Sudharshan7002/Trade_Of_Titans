import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'table';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  count = 1,
}) => {
  const items = Array.from({ length: count });

  if (variant === 'circle') {
    return (
      <div
        className={`rounded-full bg-slate-200/70 dark:bg-white/5 animate-pulse border border-slate-200/50 dark:border-white/5 ${className}`}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`rounded-2xl bg-white dark:bg-titan-900 border border-slate-200/80 dark:border-white/10 p-6 space-y-4 animate-pulse shadow-sm ${className}`}
      >
        <div className="h-4 bg-slate-200/70 dark:bg-white/10 rounded w-1/3" />
        <div className="h-8 bg-slate-200/70 dark:bg-white/10 rounded w-2/3" />
        <div className="h-4 bg-slate-100 dark:bg-white/5 rounded w-1/2" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-3 animate-pulse ${className}`}>
        <div className="h-10 bg-slate-200/80 dark:bg-white/10 rounded-xl w-full" />
        {items.map((_, i) => (
          <div key={i} className="h-14 bg-slate-100 dark:bg-white/5 rounded-xl w-full border border-slate-200/50 dark:border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 animate-pulse ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="h-4 bg-slate-200/70 dark:bg-white/10 rounded-lg w-full" />
      ))}
    </div>
  );
};
