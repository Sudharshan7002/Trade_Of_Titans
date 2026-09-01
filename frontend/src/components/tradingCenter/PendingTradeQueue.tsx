import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { TradeConfirmModal } from './TradeConfirmModal';
import { StatusBadge } from '../ui/StatusBadge';
import { Trade } from '../../types/api';
import { 
  Building2, 
  ArrowRight, 
  DollarSign, 
  Package, 
  CheckCircle2, 
  Inbox
} from 'lucide-react';

interface PendingTradeQueueProps {
  pendingTrades: Trade[];
  isExecutable: boolean;
  onTradeConfirmed: () => void;
}

export const PendingTradeQueue: React.FC<PendingTradeQueueProps> = ({
  pendingTrades,
  isExecutable,
  onTradeConfirmed,
}) => {
  const { getCountryName, getResourceName } = useGameState();
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  if (!pendingTrades || pendingTrades.length === 0) {
    return (
      <div className="p-10 text-center bg-white dark:bg-titan-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-soft-card space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-cyan-500/10 border border-slate-200 dark:border-cyan-500/20 text-slate-700 dark:text-cyan-400 flex items-center justify-center mx-auto">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-base font-bold text-slate-950 dark:text-white">Pending Queue Clear</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          No commercial proposals are awaiting settlement authorization. When sovereign states propose trades, they will queue here in real-time.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {pendingTrades.map((trade) => {
          const importer = trade.import_country_name || getCountryName(trade.import_country_id);
          const exporter = trade.export_country_name || getCountryName(trade.export_country_id);
          const resource = trade.resource_name || getResourceName(trade.resource_id);
          const paymentResource =
            trade.payment_resource_name || getResourceName(trade.payment_resource_id || undefined);
          const totalCash = Number(trade.price) * trade.quantity;

          return (
            <div
              key={trade.id}
              className="p-5 rounded-2xl bg-white dark:bg-titan-900 border border-amber-300 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-cyan-500/50 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden group shadow-soft-card"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />

              <div className="space-y-3 flex-1 min-w-0 pl-1">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-amber-800 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-500/20">
                    TRADE #{trade.id}
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Round #{trade.round_id}</span>
                  <StatusBadge status="pending" size="sm" />
                </div>

                {/* Country Flow */}
                <div className="flex items-center gap-2 sm:gap-3 text-sm font-semibold flex-wrap">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-500/20">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>{exporter}</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

                  <div className="flex items-center gap-1.5 text-sky-800 dark:text-cyan-400 bg-sky-50 dark:bg-cyan-950/40 px-3 py-1 rounded-xl border border-sky-200 dark:border-cyan-500/20">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>{importer}</span>
                  </div>
                </div>

                {/* Terms Summary */}
                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                    <span className="font-bold text-slate-950 dark:text-white">{trade.quantity.toLocaleString()} units</span> of{' '}
                    <span className="text-sky-700 dark:text-cyan-300 font-semibold">{resource}</span>
                  </div>

                  <span className="text-slate-300 dark:text-slate-600">•</span>

                  {trade.trade_type === 'money' ? (
                    <div className="flex items-center gap-1 text-amber-700 dark:text-amber-300 font-mono font-bold">
                      <DollarSign className="w-4 h-4" />
                      <span>${totalCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${Number(trade.price).toFixed(2)}/unit)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-purple-700 dark:text-purple-300 font-mono font-bold">
                      <Package className="w-4 h-4" />
                      <span>{trade.payment_quantity?.toLocaleString()} {paymentResource}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="shrink-0 flex items-center gap-3">
                <button
                  onClick={() => setSelectedTrade(trade)}
                  disabled={!isExecutable}
                  className="w-full lg:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Trade</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedTrade && (
        <TradeConfirmModal
          trade={selectedTrade}
          isOpen={!!selectedTrade}
          onClose={() => setSelectedTrade(null)}
          onConfirmed={onTradeConfirmed}
          isExecutable={isExecutable}
        />
      )}
    </>
  );
};
