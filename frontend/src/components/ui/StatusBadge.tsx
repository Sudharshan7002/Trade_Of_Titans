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

  let bgClass = 'bg-slate-800/80 text-slate-300 border-slate-700/60';
  let icon = <Clock className="w-3.5 h-3.5" />;
  let displayLabel = label || status;

  if (normStatus === 'completed' || normStatus === 'active' || normStatus === 'started') {
    bgClass = 'bg-emerald-950/70 text-emerald-400 border-emerald-500/30 shadow-sm';
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    if (!label) displayLabel = normStatus === 'completed' ? 'Completed' : normStatus === 'active' ? 'Active' : 'Started';
  } else if (normStatus === 'pending') {
    bgClass = 'bg-amber-950/70 text-amber-300 border-amber-500/30 animate-pulse-slow';
    icon = <Clock className="w-3.5 h-3.5 text-amber-400" />;
    if (!label) displayLabel = 'Pending Review';
  } else if (normStatus === 'rejected' || normStatus === 'failed' || normStatus === 'finished') {
    bgClass = 'bg-rose-950/70 text-rose-300 border-rose-500/30';
    icon = <XCircle className="w-3.5 h-3.5 text-rose-400" />;
    if (!label) displayLabel = normStatus === 'finished' ? 'Finished' : 'Failed';
  } else if (normStatus === 'inactive' || normStatus === 'not_started') {
    bgClass = 'bg-slate-900/80 text-slate-400 border-slate-700/40';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />;
    if (!label) displayLabel = normStatus === 'not_started' ? 'Not Started' : 'Inactive';
  } else if (normStatus === 'admin') {
    bgClass = 'bg-purple-950/80 text-purple-300 border-purple-500/40 shadow-glow-violet/20';
    icon = <Shield className="w-3.5 h-3.5 text-purple-400" />;
    if (!label) displayLabel = 'Supreme Admin';
  } else if (normStatus === 'trading_center') {
    bgClass = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-glow-cyan/20';
    icon = <Globe className="w-3.5 h-3.5 text-cyan-400" />;
    if (!label) displayLabel = 'Trading Center';
  } else if (normStatus === 'country') {
    bgClass = 'bg-blue-950/80 text-blue-300 border-blue-500/40';
    icon = <Globe className="w-3.5 h-3.5 text-blue-400" />;
    if (!label) displayLabel = 'National Delegate';
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-bold tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md uppercase tracking-wider ${sizeClasses[size]} ${bgClass}`}
    >
      {showIcon && icon}
      <span>{displayLabel}</span>
    </span>
  );
};
