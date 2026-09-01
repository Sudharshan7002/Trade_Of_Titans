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
        className={`rounded-full bg-neutral-200/70 dark:bg-white/5 animate-pulse border border-neutral-200/50 dark:border-white/5 ${className}`}
      />
    );
  }

  if (variant === 'card') {
    return (
      <div
        className={`rounded-3xl bg-white dark:bg-[#111111] border border-neutral-200/80 dark:border-white/10 p-6 space-y-4 animate-pulse shadow-sm ${className}`}
      >
        <div className="h-4 bg-neutral-200/70 dark:bg-white/10 rounded w-1/3" />
        <div className="h-8 bg-neutral-200/70 dark:bg-white/10 rounded w-2/3" />
        <div className="h-4 bg-neutral-100 dark:bg-white/5 rounded w-1/2" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-3 animate-pulse ${className}`}>
        <div className="h-10 bg-neutral-200/80 dark:bg-white/10 rounded-2xl w-full" />
        {items.map((_, i) => (
          <div key={i} className="h-14 bg-neutral-100 dark:bg-white/5 rounded-2xl w-full border border-neutral-200/50 dark:border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 animate-pulse ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="h-4 bg-neutral-200/70 dark:bg-white/10 rounded-lg w-full" />
      ))}
    </div>
  );
};
