import React from 'react';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface TradeSlotTrackerProps {
  hasUsedImport: boolean;
  hasUsedExport: boolean;
  isRoundActive: boolean;
}

export const TradeSlotTracker: React.FC<TradeSlotTrackerProps> = ({
  hasUsedImport,
  hasUsedExport,
  isRoundActive,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Import Slot */}
      <div
        className={`p-5 rounded-2xl border transition-all duration-300 ${
          !isRoundActive
            ? 'bg-neutral-100 dark:bg-neutral-900/40 border-neutral-200 dark:border-white/5 opacity-60'
            : hasUsedImport
            ? 'bg-neutral-50 dark:bg-[#181818] border-[#FF5533]/40'
            : 'bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#CCFF00]/40 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                hasUsedImport
                  ? 'bg-[#FF5533]/15 border-[#FF5533]/40 text-[#FF5533]'
                  : 'bg-black text-[#CCFF00] dark:bg-[#CCFF00] dark:text-black border-transparent'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                Round Import Slot
              </span>
              <div className="text-sm font-display font-bold text-black dark:text-white">
                {hasUsedImport ? 'Quota Utilized' : 'Slot Available'}
              </div>
            </div>
          </div>
          {hasUsedImport ? (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-white bg-[#FF5533] px-2.5 py-0.5 rounded-full">
              1 / 1 USED
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-black bg-[#CCFF00] px-2.5 py-0.5 rounded-full">
              0 / 1 READY
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500 mt-2.5">
          {hasUsedImport
            ? 'Your country has already submitted or completed an import this round.'
            : 'You may import resources from any sovereign partner.'}
        </p>
      </div>

      {/* Export Slot */}
      <div
        className={`p-5 rounded-2xl border transition-all duration-300 ${
          !isRoundActive
            ? 'bg-neutral-100 dark:bg-neutral-900/40 border-neutral-200 dark:border-white/5 opacity-60'
            : hasUsedExport
            ? 'bg-neutral-50 dark:bg-[#181818] border-[#FF5533]/40'
            : 'bg-white dark:bg-[#111111] border-neutral-200 dark:border-[#CCFF00]/40 shadow-sm'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl border ${
                hasUsedExport
                  ? 'bg-[#FF5533]/15 border-[#FF5533]/40 text-[#FF5533]'
                  : 'bg-black text-[#CCFF00] dark:bg-[#CCFF00] dark:text-black border-transparent'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
                Round Export Slot
              </span>
              <div className="text-sm font-display font-bold text-black dark:text-white">
                {hasUsedExport ? 'Quota Utilized' : 'Slot Available'}
              </div>
            </div>
          </div>
          {hasUsedExport ? (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-white bg-[#FF5533] px-2.5 py-0.5 rounded-full">
              1 / 1 USED
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-black bg-[#CCFF00] px-2.5 py-0.5 rounded-full">
              0 / 1 READY
            </span>
          )}
        </div>
        <p className="text-xs text-neutral-500 mt-2.5">
          {hasUsedExport
            ? 'Your country has already fulfilled its outbound export allocation.'
            : 'You may export resources to any sovereign buyer.'}
        </p>
      </div>
    </div>
  );
};
