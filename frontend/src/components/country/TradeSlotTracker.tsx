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
        className={`p-4 rounded-2xl border transition-all duration-300 ${
          !isRoundActive
            ? 'bg-slate-900/40 border-white/5 opacity-60'
            : hasUsedImport
            ? 'bg-titan-900/80 border-amber-500/30'
            : 'bg-titan-900/80 border-cyan-500/40 shadow-glow-cyan/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                hasUsedImport
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Round Import Slot
              </span>
              <div className="text-sm font-bold text-white">
                {hasUsedImport ? 'Quota Utilized' : 'Slot Available'}
              </div>
            </div>
          </div>
          {hasUsedImport ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              1 / 1 USED
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
              0 / 1 READY
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          {hasUsedImport
            ? 'Your country has already submitted or completed an import this round.'
            : 'You may import resources from any sovereign partner.'}
        </p>
      </div>

      {/* Export Slot */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-300 ${
          !isRoundActive
            ? 'bg-slate-900/40 border-white/5 opacity-60'
            : hasUsedExport
            ? 'bg-titan-900/80 border-amber-500/30'
            : 'bg-titan-900/80 border-emerald-500/40 shadow-glow-emerald/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl border ${
                hasUsedExport
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Round Export Slot
              </span>
              <div className="text-sm font-bold text-white">
                {hasUsedExport ? 'Quota Utilized' : 'Slot Available'}
              </div>
            </div>
          </div>
          {hasUsedExport ? (
            <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              1 / 1 USED
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              0 / 1 READY
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-400 mt-2">
          {hasUsedExport
            ? 'Your country has already submitted or completed an export this round.'
            : 'You may export surplus resources for money or barter goods.'}
        </p>
      </div>
    </div>
  );
};
