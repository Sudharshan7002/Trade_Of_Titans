import React from 'react';
import { Trophy, CheckCircle2, Target, Sparkles } from 'lucide-react';
import { ImportObjective } from '../../types/api';

interface QuotaProgressRingProps {
  objectives: ImportObjective[];
  getResourceName: (id: number) => string;
}

export const QuotaProgressRing: React.FC<QuotaProgressRingProps> = ({
  objectives,
  getResourceName,
}) => {
  const totalCount = objectives.length;
  const completedCount = objectives.filter(
    (o) => Number(o.imported_quantity) >= Number(o.required_quantity)
  ).length;

  const totalRequiredUnits = objectives.reduce(
    (acc, o) => acc + Number(o.required_quantity),
    0
  );
  const totalImportedUnits = objectives.reduce(
    (acc, o) => acc + Math.min(Number(o.imported_quantity), Number(o.required_quantity)),
    0
  );

  const unitPercentage =
    totalRequiredUnits > 0
      ? Math.min(100, Math.round((totalImportedUnits / totalRequiredUnits) * 100))
      : 0;

  const isAllComplete = totalCount > 0 && completedCount === totalCount;

  // SVG Circle calculations
  const size = 110;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (unitPercentage / 100) * circumference;

  return (
    <div
      className={`p-6 rounded-2xl border transition-all shadow-sm ${
        isAllComplete
          ? 'bg-white dark:bg-[#111111] border-[#FFD000]/50 shadow-glow-gold/20'
          : 'bg-white dark:bg-[#111111] border-neutral-200 dark:border-white/10'
      }`}
    >
      <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 dark:text-neutral-400 uppercase flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#FF5533] dark:text-[#CCFF00]" />
            // National Strategic Progress
          </span>
          <h3 className="font-display font-bold text-xl text-black dark:text-white mt-0.5 flex items-center gap-2">
            Import Quota <span className="text-[#FF5533] dark:text-[#CCFF00]">Fulfillment</span>
            {isAllComplete && (
              <span className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-[#FFD000] text-black text-xs font-display font-bold uppercase tracking-wider shadow-sm animate-pulse">
                <Sparkles className="w-3 h-3" /> Complete!
              </span>
            )}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
            Strategic Quotas:{' '}
            <strong className="text-black dark:text-white font-bold">
              {completedCount} of {totalCount}
            </strong>
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Progress Ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-neutral-100 dark:text-neutral-800 fill-none"
            />
            {/* Progress circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`transition-all duration-1000 ease-out fill-none ${
                isAllComplete
                  ? 'text-[#FFD000]'
                  : 'text-black dark:text-[#CCFF00]'
              }`}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-display font-black text-black dark:text-white leading-none">
              {unitPercentage}%
            </span>
            <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mt-0.5">
              Fulfilled
            </span>
          </div>
        </div>

        {/* Objective Badges & Breakdown */}
        <div className="flex-1 w-full space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {objectives.map((obj, idx) => {
              const resName = getResourceName(obj.resource_id);
              const imported = Number(obj.imported_quantity);
              const required = Number(obj.required_quantity);
              const isMet = imported >= required;
              const pct = required > 0 ? Math.min(100, Math.round((imported / required) * 100)) : 0;

              return (
                <div
                  key={obj.id || idx}
                  className={`p-3 rounded-2xl border transition-all ${
                    isMet
                      ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40 text-black dark:text-[#CCFF00]'
                      : 'bg-neutral-50 dark:bg-[#181818] border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-display font-bold text-xs text-black dark:text-white truncate max-w-[120px]">
                      {resName}
                    </span>
                    {isMet ? (
                      <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-black dark:text-[#CCFF00] uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Met
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 font-semibold">
                        {pct}%
                      </span>
                    )}
                  </div>

                  <div className="w-full bg-neutral-200 dark:bg-black/50 rounded-full h-1.5 overflow-hidden mb-1">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isMet ? 'bg-black dark:bg-[#CCFF00]' : 'bg-neutral-800 dark:bg-neutral-400'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 flex justify-between">
                    <span>{imported.toLocaleString()}</span>
                    <span>/ {required.toLocaleString()} u</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 100% Completion Victory Banner */}
          {isAllComplete && (
            <div className="p-3.5 rounded-2xl bg-[#FFD000]/15 border border-[#FFD000]/40 flex items-center gap-3 shadow-sm">
              <div className="p-2 rounded-xl bg-[#FFD000] text-black shrink-0 shadow-sm">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-display font-bold text-black dark:text-[#FFD000]">
                  All Strategic Quotas Fulfilled!
                </p>
                <p className="text-[11px] text-neutral-700 dark:text-neutral-300">
                  Your state has secured maximum strategic bonus points toward the final championship podium.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
