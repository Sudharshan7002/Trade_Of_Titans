import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, PlayCircle } from 'lucide-react';
import { Round } from '../../types/api';

interface RoundCountdownTimerProps {
  round?: Round | null | {
    id: number;
    round_number: number;
    is_active?: boolean;
    duration_minutes?: number;
    ends_at_timestamp?: number | null;
  };
  compact?: boolean;
}

export const RoundCountdownTimer: React.FC<RoundCountdownTimerProps> = ({
  round,
  compact = false,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (!round || !round.ends_at_timestamp) {
      setSecondsLeft(null);
      return;
    }

    const updateTimer = () => {
      const now = Date.now() / 1000;
      const diff = Math.max(0, Math.floor(round.ends_at_timestamp! - now));
      setSecondsLeft(diff);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [round?.ends_at_timestamp]);

  if (!round || !round.is_active || secondsLeft === null) {
    if (compact) {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Intermission</span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-titan-950/70 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-xs font-mono">
        <PlayCircle className="w-4 h-4 text-slate-500" />
        <span>Round #{round?.round_number || 1} &bull; Standing By</span>
      </div>
    );
  }

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isExpired = secondsLeft === 0;
  const isCritical = secondsLeft <= 60 && !isExpired;
  const isUrgent = secondsLeft <= 180 && !isCritical && !isExpired;

  // Visual Theme adapting to Light / Dark Mode
  let containerStyle = 'bg-slate-100 dark:bg-cyan-500/10 border-slate-300 dark:border-cyan-500/30 text-slate-900 dark:text-cyan-300';
  let clockColor = 'text-slate-700 dark:text-cyan-400';

  if (isExpired) {
    containerStyle = 'bg-rose-50 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/50 text-rose-800 dark:text-rose-300 animate-pulse';
    clockColor = 'text-rose-600 dark:text-rose-400';
  } else if (isCritical) {
    containerStyle = 'bg-rose-50 dark:bg-rose-500/20 border-rose-300 dark:border-rose-500/50 text-rose-800 dark:text-rose-300 animate-pulse shadow-sm';
    clockColor = 'text-rose-600 dark:text-rose-400';
  } else if (isUrgent) {
    containerStyle = 'bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300';
    clockColor = 'text-amber-600 dark:text-amber-400';
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1 rounded-xl border font-mono font-bold text-xs tracking-wider transition-all shadow-sm ${containerStyle}`}>
        {isCritical ? (
          <AlertTriangle className={`w-3.5 h-3.5 ${clockColor} animate-bounce`} />
        ) : (
          <Clock className={`w-3.5 h-3.5 ${clockColor}`} />
        )}
        <span>{isExpired ? 'TIME UP' : timeString}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border font-mono transition-all backdrop-blur-md shadow-soft-card ${containerStyle}`}>
      <div className="p-1.5 rounded-lg bg-black/10 dark:bg-black/40">
        {isCritical ? (
          <AlertTriangle className={`w-4 h-4 ${clockColor} animate-bounce`} />
        ) : (
          <Clock className={`w-4 h-4 ${clockColor}`} />
        )}
      </div>
      <div>
        <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 leading-none mb-0.5">
          {isExpired ? 'Trading Window Closed' : isCritical ? 'Final Minute!' : `Round #${round.round_number} Timer`}
        </div>
        <div className="text-xl font-black tracking-widest leading-none">
          {isExpired ? '00:00' : timeString}
        </div>
      </div>
    </div>
  );
};
