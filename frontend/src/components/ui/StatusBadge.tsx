import React from 'react';
import { Shield, CheckCircle2, Clock, XCircle, AlertTriangle, Globe } from 'lucide-react';
import { TradeStatus, UserRole } from '../../types/api';

interface StatusBadgeProps {
  status?: TradeStatus | 'active' | 'inactive' | 'started' | 'finished' | 'not_started' | UserRole | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  label?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  label,
}) => {
  const normStatus = (status || '').toLowerCase();

  let bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60';
  let icon = <Clock className="w-3.5 h-3.5" />;
  let displayLabel = label || status;

  if (normStatus === 'completed' || normStatus === 'active' || normStatus === 'started') {
    bgClass = 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30 shadow-sm';
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    if (!label) displayLabel = normStatus === 'completed' ? 'Completed' : normStatus === 'active' ? 'Active' : 'Started';
  } else if (normStatus === 'pending') {
    bgClass = 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 animate-pulse';
    icon = <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    if (!label) displayLabel = 'Pending Review';
  } else if (normStatus === 'rejected' || normStatus === 'failed' || normStatus === 'finished') {
    bgClass = 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-500/30';
    icon = <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />;
    if (!label) displayLabel = normStatus === 'finished' ? 'Finished' : 'Failed';
  } else if (normStatus === 'inactive' || normStatus === 'not_started') {
    bgClass = 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700/40';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />;
    if (!label) displayLabel = normStatus === 'not_started' ? 'Not Started' : 'Inactive';
  } else if (normStatus === 'admin') {
    bgClass = 'bg-purple-50 dark:bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 shadow-sm';
    icon = <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />;
    if (!label) displayLabel = 'Supreme Admin';
  } else if (normStatus === 'trading_center') {
    bgClass = 'bg-sky-50 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-500/30 shadow-sm';
    icon = <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />;
    if (!label) displayLabel = 'Trading Center';
  } else if (normStatus === 'country') {
    bgClass = 'bg-blue-50 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/30 shadow-sm';
    icon = <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    if (!label) displayLabel = 'National Delegate';
  } else if (normStatus === 'ranking') {
    bgClass = 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30 shadow-sm';
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    if (!label) displayLabel = 'Rankings Desk';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-mono font-bold',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-mono font-bold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-mono font-bold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border uppercase tracking-wider ${sizeClasses[size]} ${bgClass}`}
    >
      {showIcon && icon}
      <span>{displayLabel}</span>
    </span>
  );
};
