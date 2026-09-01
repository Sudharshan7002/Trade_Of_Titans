import React from 'react';
import { Building2, Trophy } from 'lucide-react';
import { LiveRanking, FinalRanking } from '../../types/api';

interface RankingsTableProps {
  rankings: (LiveRanking | FinalRanking)[];
}

export const RankingsTable: React.FC<RankingsTableProps> = ({ rankings }) => {
  if (rankings.length === 0) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111111] rounded-2xl border border-neutral-200 dark:border-white/10 space-y-2">
        <Trophy className="w-10 h-10 text-neutral-400 mx-auto" />
        <p className="text-sm font-display font-bold text-black dark:text-white">Leaderboard Standby</p>
        <p className="text-xs text-neutral-500">
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
          <tr className="border-b border-neutral-200 dark:border-white/10 text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            <th className="py-3 px-4">Rank</th>
            <th className="py-3 px-4">Sovereign State</th>
            <th className="py-3 px-4 text-right">Treasury Reserves</th>
            <th className="py-3 px-4 text-right">Strategic Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-100 dark:divide-white/5 text-xs">
          {sorted.map((r) => {
            const money = 'final_money' in r ? r.final_money : r.money;

            let rankBadge = (
              <span className="font-mono font-bold text-neutral-500 dark:text-neutral-400">#{r.rank}</span>
            );

            if (r.rank === 1) {
              rankBadge = (
                <span className="inline-flex items-center gap-1 font-display font-bold text-black bg-[#FFD000] px-2.5 py-1 rounded-xl text-xs shadow-sm">
                  🥇 1st Place
                </span>
              );
            } else if (r.rank === 2) {
              rankBadge = (
                <span className="inline-flex items-center gap-1 font-display font-bold text-black dark:text-white bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-xl border border-neutral-300 dark:border-white/10 text-xs">
                  🥈 2nd Place
                </span>
              );
            } else if (r.rank === 3) {
              rankBadge = (
                <span className="inline-flex items-center gap-1 font-display font-bold text-white bg-[#FF5533] px-2.5 py-1 rounded-xl text-xs">
                  🥉 3rd Place
                </span>
              );
            }

            return (
              <tr
                key={r.country_id}
                className={`transition-colors ${
                  r.rank === 1
                    ? 'bg-[#FFD000]/10 hover:bg-[#FFD000]/15'
                    : 'hover:bg-neutral-50 dark:hover:bg-white/5'
                }`}
              >
                <td className="py-3.5 px-4">{rankBadge}</td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2.5 font-display font-bold text-black dark:text-white text-sm">
                    <Building2 className="w-4 h-4 text-[#FF5533] dark:text-[#CCFF00]" />
                    <span>{r.country_name}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right font-mono font-semibold text-neutral-900 dark:text-neutral-200">
                  ${Number(money).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-right font-display font-black text-black dark:text-[#CCFF00] text-sm">
                  {Number(r.score).toLocaleString('en-US', { minimumFractionDigits: 1 })}{' '}
                  <span className="text-[11px] font-normal text-neutral-500">pts</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
