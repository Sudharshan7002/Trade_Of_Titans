import React from 'react';
import { useGameState } from '../../context/GameStateContext';
import { StatusBadge } from '../ui/StatusBadge';
import { ArrowDownLeft, ArrowUpRight, DollarSign, Package, History } from 'lucide-react';
import { Trade } from '../../types/api';

interface CountryTradeHistoryProps {
  trades: Trade[];
  myCountryId: number;
}

export const CountryTradeHistory: React.FC<CountryTradeHistoryProps> = ({
  trades,
  myCountryId,
}) => {
  const { getCountryName, getResourceName } = useGameState();

  if (!trades || trades.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111111] rounded-2xl border border-neutral-200 dark:border-white/10 space-y-2">
        <History className="w-10 h-10 text-neutral-400 mx-auto" />
        <p className="text-sm font-display font-bold text-black dark:text-white">No Recorded Trade Orders</p>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
          Your state has not engaged in any commercial agreements yet. Orders will appear here once executed.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto subtle-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
            <th className="py-3 px-4">Trade ID</th>
            <th className="py-3 px-4">Vector</th>
            <th className="py-3 px-4">Round</th>
            <th className="py-3 px-4">Counterparty</th>
            <th className="py-3 px-4">Resource & Quantity</th>
            <th className="py-3 px-4">Settlement Terms</th>
            <th className="py-3 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-white/5 text-xs">
          {trades.map((trade) => {
            const isImporter = trade.import_country_id === myCountryId;
            const counterpartyId = isImporter ? trade.export_country_id : trade.import_country_id;
            const counterpartyName = getCountryName(counterpartyId);
            const resourceName = getResourceName(trade.resource_id);

            return (
              <tr key={trade.id} className="hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4 font-mono font-semibold text-neutral-500 dark:text-neutral-400">
                  #{trade.id}
                </td>
                <td className="py-3.5 px-4">
                  {isImporter ? (
                    <span className="inline-flex items-center gap-1 font-display font-bold text-black dark:text-[#CCFF00] bg-[#CCFF00]/15 px-2.5 py-0.5 rounded-lg border border-[#CCFF00]/40 text-xs">
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      IMPORT
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-display font-bold text-white bg-[#FF5533] px-2.5 py-0.5 rounded-lg text-xs">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      EXPORT
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-black dark:text-white">
                  Round #{trade.round_id}
                </td>
                <td className="py-3.5 px-4 font-display font-bold text-black dark:text-white">
                  {counterpartyName}
                </td>
                <td className="py-3.5 px-4 font-mono text-neutral-800 dark:text-neutral-200">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{trade.quantity.toLocaleString()} u {resourceName}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                  {trade.trade_type === 'money' ? (
                    <div className="flex items-center gap-1 text-black dark:text-[#CCFF00] font-bold">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>
                        {(Number(trade.price) * trade.quantity).toFixed(2)}{' '}
                        <span className="text-[10px] text-neutral-500 font-normal">
                          (${Number(trade.price).toFixed(2)}/u)
                        </span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[#FF5533] font-bold">
                      <Package className="w-3.5 h-3.5" />
                      <span>
                        {trade.payment_quantity ?? 0}{' '}
                        {trade.payment_resource_name || getResourceName(trade.payment_resource_id)}
                      </span>
                    </div>
                  )}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <StatusBadge status={trade.status} size="sm" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
