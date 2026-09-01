import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { StatusBadge } from '../ui/StatusBadge';
import { TradeConfirmModal } from './TradeConfirmModal';
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  DollarSign, 
  Package, 
  Inbox 
} from 'lucide-react';
import { Trade } from '../../types/api';

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
      <div className="p-10 text-center bg-white dark:bg-[#111111] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-sm space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 text-black dark:text-[#CCFF00] flex items-center justify-center mx-auto">
          <Inbox className="w-6 h-6" />
        </div>
        <h4 className="text-base font-display font-bold text-black dark:text-white">Pending Queue Clear</h4>
        <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
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
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-white/10 hover:border-black dark:hover:border-[#CCFF00]/50 transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden group shadow-sm"
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#FFD000]" />

              <div className="space-y-3 flex-1 min-w-0 pl-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-black dark:text-[#FFD000] bg-[#FFD000]/15 px-2.5 py-1 rounded-lg border border-[#FFD000]/40">
                    TRADE #{trade.id}
                  </span>
                  <span className="text-xs font-mono text-neutral-500">Round #{trade.round_id}</span>
                  <StatusBadge status="pending" size="sm" />
                </div>

                {/* Country Flow */}
                <div className="flex items-center gap-2 sm:gap-3 text-sm font-semibold flex-wrap">
                  <div className="flex items-center gap-1.5 text-black dark:text-[#CCFF00] bg-[#CCFF00]/15 px-3 py-1 rounded-xl border border-[#CCFF00]/40">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>{exporter}</span>
                  </div>

                  <ArrowRight className="w-4 h-4 text-[#FF5533] shrink-0" />

                  <div className="flex items-center gap-1.5 text-white bg-[#FF5533] px-3 py-1 rounded-xl border border-[#FF5533]">
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>{importer}</span>
                  </div>
                </div>

                {/* Terms Summary */}
                <div className="flex items-center gap-4 text-xs text-neutral-700 dark:text-neutral-300 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-neutral-500" />
                    <span className="font-bold text-black dark:text-white">{trade.quantity.toLocaleString()} units</span> of{' '}
                    <span className="font-display font-bold text-black dark:text-white">{resource}</span>
                  </div>

                  <span className="text-neutral-400">•</span>

                  {trade.trade_type === 'money' ? (
                    <div className="flex items-center gap-1 text-black dark:text-[#CCFF00] font-mono font-bold">
                      <DollarSign className="w-4 h-4" />
                      <span>${totalCash.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${Number(trade.price).toFixed(2)}/unit)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[#FF5533] font-mono font-bold">
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
                  className="w-full lg:w-auto px-6 py-3 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black font-display font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4 text-black" />
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
