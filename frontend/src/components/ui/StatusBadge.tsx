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

  let bgClass = 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 border-neutral-200 dark:border-white/10';
  let icon = <Clock className="w-3.5 h-3.5" />;
  let displayLabel = label || status;

  if (normStatus === 'completed' || normStatus === 'active' || normStatus === 'started') {
    bgClass = 'bg-[#CCFF00] text-black border-[#A3CC00] shadow-[0_0_12px_rgba(204,255,0,0.35)]';
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-black" />;
    if (!label) displayLabel = normStatus === 'completed' ? 'Completed' : normStatus === 'active' ? 'Active' : 'Started';
  } else if (normStatus === 'pending') {
    bgClass = 'bg-[#FFD000] text-black border-[#D4A700] animate-pulse shadow-[0_0_12px_rgba(255,208,0,0.3)]';
    icon = <Clock className="w-3.5 h-3.5 text-black" />;
    if (!label) displayLabel = 'Pending Review';
  } else if (normStatus === 'rejected' || normStatus === 'failed' || normStatus === 'finished') {
    bgClass = 'bg-[#FF5533] text-white border-[#E03D1B] shadow-[0_0_12px_rgba(255,85,51,0.3)]';
    icon = <XCircle className="w-3.5 h-3.5 text-white" />;
    if (!label) displayLabel = normStatus === 'finished' ? 'Finished' : 'Failed';
  } else if (normStatus === 'inactive' || normStatus === 'not_started') {
    bgClass = 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-white/10';
    icon = <AlertTriangle className="w-3.5 h-3.5 text-neutral-400" />;
    if (!label) displayLabel = normStatus === 'not_started' ? 'Not Started' : 'Inactive';
  } else if (normStatus === 'admin') {
    bgClass = 'bg-black text-[#CCFF00] dark:bg-white dark:text-black border-black/10 dark:border-white/20 shadow-sm';
    icon = <Shield className="w-3.5 h-3.5" />;
    if (!label) displayLabel = 'Supreme Admin';
  } else if (normStatus === 'trading_center') {
    bgClass = 'bg-black text-white dark:bg-white dark:text-black border-black/10 dark:border-white/20 shadow-sm';
    icon = <Globe className="w-3.5 h-3.5" />;
    if (!label) displayLabel = 'Trading Desk';
  } else if (normStatus === 'country') {
    bgClass = 'bg-neutral-100 dark:bg-[#1A1A1A] text-black dark:text-[#CCFF00] border-neutral-300 dark:border-white/10 shadow-sm';
    icon = <Globe className="w-3.5 h-3.5" />;
    if (!label) displayLabel = 'National Delegate';
  } else if (normStatus === 'ranking') {
    bgClass = 'bg-[#FFD000]/15 text-[#B38F00] dark:text-[#FFD000] border-[#FFD000]/30 shadow-sm';
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD000]" />;
    if (!label) displayLabel = 'Rankings Desk';
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2.5 py-0.5 gap-1 font-display font-bold',
    md: 'text-xs px-3 py-1 gap-1.5 font-display font-bold',
    lg: 'text-sm px-4 py-1.5 gap-2 font-display font-bold',
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
