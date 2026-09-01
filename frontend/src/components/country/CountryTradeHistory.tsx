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
      <div className="p-8 text-center bg-white dark:bg-titan-900 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
        <History className="w-10 h-10 text-slate-400 mx-auto" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Recorded Trade Orders</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Your state has not engaged in any commercial agreements yet. Orders will appear here once executed.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto subtle-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th className="py-3 px-4">Trade ID</th>
            <th className="py-3 px-4">Vector</th>
            <th className="py-3 px-4">Round</th>
            <th className="py-3 px-4">Counterparty</th>
            <th className="py-3 px-4">Resource & Quantity</th>
            <th className="py-3 px-4">Settlement Terms</th>
            <th className="py-3 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
          {trades.map((trade) => {
            const isImporter = trade.import_country_id === myCountryId;
            const counterpartyId = isImporter ? trade.export_country_id : trade.import_country_id;
            const counterpartyName = getCountryName(counterpartyId);
            const resourceName = getResourceName(trade.resource_id);

            return (
              <tr key={trade.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                  #{trade.id}
                </td>
                <td className="py-3.5 px-4">
                  {isImporter ? (
                    <span className="inline-flex items-center gap-1 font-bold text-sky-700 dark:text-cyan-400 bg-sky-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded-md border border-sky-200 dark:border-cyan-500/20">
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      IMPORT
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-500/20">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      EXPORT
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                  Round #{trade.round_id}
                </td>
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                  {counterpartyName}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-slate-400" />
                    <span>{trade.quantity.toLocaleString()} u {resourceName}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                  {trade.trade_type === 'money' ? (
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-300">
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>
                        {(Number(trade.price) * trade.quantity).toFixed(2)}{' '}
                        <span className="text-[10px] text-slate-400">
                          (${Number(trade.price).toFixed(2)}/u)
                        </span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-purple-300 font-mono font-semibold">
                      <Package className="w-3.5 h-3.5" />
                      <span>
                        {trade.payment_quantity}{' '}
                        {getResourceName(trade.payment_resource_id || undefined)}
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
