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
      <div className="p-8 text-center glass-card rounded-2xl border border-white/5 space-y-2">
        <History className="w-10 h-10 text-slate-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-300">No Recorded Trade Orders</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Your state has not engaged in any commercial agreements yet. Submit an order using the Trade Launcher.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto subtle-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            <th className="py-3 px-4">Trade ID</th>
            <th className="py-3 px-4">Vector</th>
            <th className="py-3 px-4">Round</th>
            <th className="py-3 px-4">Counterparty</th>
            <th className="py-3 px-4">Resource & Quantity</th>
            <th className="py-3 px-4">Settlement Terms</th>
            <th className="py-3 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-xs">
          {trades.map((trade) => {
            const isImporter = trade.import_country_id === myCountryId;
            const counterpartyId = isImporter ? trade.export_country_id : trade.import_country_id;
            const counterpartyName = getCountryName(counterpartyId);
            const resourceName = getResourceName(trade.resource_id);

            return (
              <tr key={trade.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-300">
                  #{trade.id}
                </td>
                <td className="py-3.5 px-4">
                  {isImporter ? (
                    <span className="inline-flex items-center gap-1 font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      IMPORT
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      EXPORT
                    </span>
                  )}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-300">
                  R#{trade.round_id}
                </td>
                <td className="py-3.5 px-4 font-medium text-white">
                  {counterpartyName}
                </td>
                <td className="py-3.5 px-4">
                  <div className="font-semibold text-white">{resourceName}</div>
                  <div className="text-[11px] text-slate-400">{trade.quantity} units</div>
                </td>
                <td className="py-3.5 px-4">
                  {trade.trade_type === 'money' ? (
                    <div className="flex items-center gap-1 text-amber-300 font-mono font-semibold">
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
