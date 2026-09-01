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
      <div className="p-8 text-center glass-card rounded-2xl border border-white/5 space-y-2">
        <CheckCheck className="w-10 h-10 text-slate-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-300">No Historical Trades Yet</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Executed international agreements will appear in this audited settlement feed.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto subtle-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            <th className="py-3 px-4">ID</th>
            <th className="py-3 px-4">Round</th>
            <th className="py-3 px-4">Transfer Direction</th>
            <th className="py-3 px-4">Commodity</th>
            <th className="py-3 px-4">Settlement</th>
            <th className="py-3 px-4 text-right">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-xs">
          {completedTrades.map((t) => {
            const exporter = t.export_country_name || getCountryName(t.export_country_id);
            const importer = t.import_country_name || getCountryName(t.import_country_id);
            const resource = t.resource_name || getResourceName(t.resource_id);
            const totalCash = Number(t.price) * t.quantity;

            return (
              <tr key={t.id} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-slate-300">#{t.id}</td>
                <td className="py-3 px-4 font-mono text-slate-400">R#{t.round_id}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-400">{exporter}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="font-semibold text-cyan-400">{importer}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium text-white">{resource}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{t.quantity} units</div>
                </td>
                <td className="py-3 px-4">
                  {t.trade_type === 'money' ? (
                    <span className="font-mono text-amber-300 font-bold">${totalCash.toFixed(2)}</span>
                  ) : (
                    <span className="font-mono text-purple-300 font-bold">
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
