import React from 'react';
import { Building2, Trophy } from 'lucide-react';
import { LiveRanking, FinalRanking } from '../../types/api';

interface RankingsTableProps {
  rankings: (LiveRanking | FinalRanking)[];
}

export const RankingsTable: React.FC<RankingsTableProps> = ({ rankings }) => {
  if (rankings.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-titan-900 rounded-2xl border border-slate-200 dark:border-white/10 space-y-2">
        <Trophy className="w-10 h-10 text-slate-400 mx-auto" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Leaderboard Standby</p>
        <p className="text-xs text-slate-500">
          Rankings will generate automatically as sovereign states conduct international trades.
        </p>
      </div>
    );
  }

  const sorted = [...rankings].sort((a, b) => a.rank - b.rank);

  return (
    <div className="overflow-x-auto subtle-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">Sovereign State</th>
            <th className="py-3 px-4 text-right">Treasury Reserves</th>
            <th className="py-3 px-4 text-right">Strategic Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs">
          {sorted.map((r) => {
            const money = 'final_money' in r ? r.final_money : r.money;

            let rankBadge = (
              <span className="font-mono font-bold text-slate-500 dark:text-slate-400">#{r.rank}</span>
            );

            if (r.rank === 1) {
              rankBadge = (
                <span className="inline-flex items-center gap-1 font-mono font-black text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-500/40 text-xs shadow-sm">
                  🥇 1st Place
                </span>
              );
            } else if (r.rank === 2) {
              rankBadge = (
                <span className="inline-flex items-center gap-1 font-mono font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-400/20 px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-400/40 text-xs">
                  🥈 2nd Place
                </span>
              );
            } else if (r.rank === 3) {
              rankBadge = (
                <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-800 dark:text-amber-500 bg-amber-50 dark:bg-amber-700/20 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-700/40 text-xs">
                  🥉 3rd Place
                </span>
              );
            }

            return (
              <tr
                key={r.country_id}
                className={`transition-colors ${
                  r.rank === 1
                    ? 'bg-amber-50/50 hover:bg-amber-100/60 dark:bg-amber-500/5 dark:hover:bg-amber-500/10'
                    : 'hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <td className="py-3.5 px-4">{rankBadge}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white text-sm">
                    <Building2 className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
                    <span>{r.country_name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-700 dark:text-emerald-400">
                  ${Number(money).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-black text-slate-950 dark:text-cyan-300 text-sm">
                  {Number(r.score).toLocaleString('en-US', { minimumFractionDigits: 1 })}{' '}
                  <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">pts</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
