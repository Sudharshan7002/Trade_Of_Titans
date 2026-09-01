import React from 'react';
import { useGameState } from '../../context/GameStateContext';
import { StatusBadge } from '../ui/StatusBadge';
import { Trade } from '../../types/api';
import { ArrowRight, CheckCheck } from 'lucide-react';

interface CompletedTradesFeedProps {
  completedTrades: Trade[];
}

export const CompletedTradesFeed: React.FC<CompletedTradesFeedProps> = ({
  completedTrades,
}) => {
  const { getCountryName, getResourceName } = useGameState();

  if (!completedTrades || completedTrades.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111111] rounded-2xl border border-neutral-200 dark:border-white/10 space-y-2">
        <CheckCheck className="w-10 h-10 text-neutral-400 mx-auto" />
        <p className="text-sm font-display font-bold text-black dark:text-white">No Historical Trades Yet</p>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Executed international agreements will appear in this audited settlement feed.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto subtle-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">Round</th>
            <th className="py-3 px-4">Transfer Direction</th>
            <th className="py-3 px-4">Commodity</th>
            <th className="py-3 px-4">Settlement</th>
            <th className="py-3 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-white/5 text-xs">
          {completedTrades.map((t) => {
            const exporter = t.export_country_name || getCountryName(t.export_country_id);
            const importer = t.import_country_name || getCountryName(t.import_country_id);
            const resource = t.resource_name || getResourceName(t.resource_id);
            const totalCash = Number(t.price) * t.quantity;

            return (
              <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-neutral-500 dark:text-neutral-400">#{t.id}</td>
                <td className="py-3 px-4 font-mono text-neutral-500">Round #{t.round_id}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-black dark:text-[#CCFF00]">{exporter}</span>
                    <ArrowRight className="w-3 h-3 text-[#FF5533]" />
                    <span className="font-display font-bold text-black dark:text-white">{importer}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-display font-bold text-black dark:text-white">{resource}</div>
                  <div className="text-[11px] text-neutral-500 font-mono">{t.quantity} units</div>
                </td>
                <td className="py-3 px-4">
                  {t.trade_type === 'money' ? (
                    <span className="font-mono text-black dark:text-[#CCFF00] font-bold">${totalCash.toFixed(2)}</span>
                  ) : (
                    <span className="font-mono text-[#FF5533] font-bold">
                      {t.payment_quantity} {getResourceName(t.payment_resource_id || undefined)}
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right">
                  <StatusBadge status="completed" size="sm" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
