import React from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { LiveRanking, FinalRanking } from '../../types/api';

interface PodiumTopThreeProps {
  rankings: (LiveRanking | FinalRanking)[];
  isFinal?: boolean;
}

export const PodiumTopThree: React.FC<PodiumTopThreeProps> = ({
  rankings,
  isFinal = false,
}) => {
  if (rankings.length === 0) return null;

  const first = rankings.find((r) => r.rank === 1);
  const second = rankings.find((r) => r.rank === 2);
  const third = rankings.find((r) => r.rank === 3);

  const getMoney = (r: LiveRanking | FinalRanking) => {
    return 'final_money' in r ? r.final_money : r.money;
  };

  return (
    <div className="relative pt-6 pb-2">
      {isFinal && (
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFD000]/15 border border-[#FFD000]/40 text-black dark:text-[#FFD000] text-xs font-display font-bold uppercase tracking-widest shadow-sm">
            <Sparkles className="w-4 h-4 text-[#FFD000]" />
            <span>Grand Victory Ceremony</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-black dark:text-white tracking-tight uppercase">
            Hall of <span className="text-[#FF5533] dark:text-[#CCFF00]">Sovereign Titans</span>
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-lg mx-auto">
            Official strategic scores settled across geopolitical trading efficiency, gross national wealth, and quota fulfillment.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end max-w-4xl mx-auto">
        {/* 2nd Place - Silver */}
        {second ? (
          <div className="order-2 md:order-1 rounded-2xl p-6 border border-neutral-200/90 dark:border-white/10 bg-white dark:bg-[#111111] flex flex-col items-center text-center shadow-sm relative group transition-all">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 flex items-center justify-center text-xl font-black mb-3">
              🥈
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-neutral-500">
              // 2nd Place (Silver)
            </span>
            <h3 className="font-display font-black text-xl text-black dark:text-white mt-1 truncate max-w-full">
              {second.country_name}
            </h3>
            <div className="mt-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/60 dark:border-white/5 w-full space-y-1">
              <div className="text-xs text-neutral-500">Total Score</div>
              <div className="font-display font-black text-xl text-black dark:text-white">
                {Number(second.score).toLocaleString('en-US', { minimumFractionDigits: 1 })} pts
              </div>
              <div className="text-[11px] text-neutral-500 font-mono">
                Treasury: ${Number(getMoney(second)).toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="order-2 md:order-1 hidden md:block" />
        )}

        {/* 1st Place - Gold (Grand Champion) */}
        {first ? (
          <div className="order-1 md:order-2 rounded-3xl p-7 border-2 border-[#FFD000] bg-white dark:bg-[#141414] flex flex-col items-center text-center shadow-md dark:shadow-glow-gold relative group md:-translate-y-4">
            <div className="absolute -top-4 flex items-center justify-center p-2 rounded-xl bg-[#FFD000] text-black shadow-md">
              <Crown className="w-5 h-5 fill-black" />
            </div>
            <div className="w-16 h-16 rounded-2xl bg-[#FFD000]/20 border border-[#FFD000]/40 flex items-center justify-center text-3xl font-black mb-3 mt-2">
              🥇
            </div>
            <span className="text-xs font-mono font-black uppercase tracking-widest text-black dark:text-[#FFD000]">
              // Supreme Champion (1st)
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-black dark:text-white mt-1 truncate max-w-full">
              {first.country_name}
            </h3>
            <div className="mt-4 p-4 rounded-2xl bg-neutral-50 dark:bg-[#1C1C1C] border border-neutral-200 dark:border-white/10 w-full space-y-1.5">
              <div className="text-xs font-display font-bold uppercase tracking-wider text-black dark:text-[#FFD000]">
                Championship Score
              </div>
              <div className="font-display font-black text-3xl sm:text-4xl text-black dark:text-[#FFD000]">
                {Number(first.score).toLocaleString('en-US', { minimumFractionDigits: 1 })} pts
              </div>
              <div className="text-xs text-neutral-600 dark:text-neutral-400 font-mono font-semibold">
                Treasury: ${Number(getMoney(first)).toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="order-1 md:order-2 hidden md:block" />
        )}

        {/* 3rd Place - Bronze */}
        {third ? (
          <div className="order-3 rounded-2xl p-6 border border-neutral-200/90 dark:border-white/10 bg-white dark:bg-[#111111] flex flex-col items-center text-center shadow-sm relative group transition-all">
            <div className="w-12 h-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-white/10 flex items-center justify-center text-xl font-black mb-3">
              🥉
            </div>
            <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FF5533]">
              // 3rd Place (Bronze)
            </span>
            <h3 className="font-display font-black text-xl text-black dark:text-white mt-1 truncate max-w-full">
              {third.country_name}
            </h3>
            <div className="mt-3 p-3.5 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/60 dark:border-white/5 w-full space-y-1">
              <div className="text-xs text-neutral-500">Total Score</div>
              <div className="font-display font-black text-xl text-[#FF5533]">
                {Number(third.score).toLocaleString('en-US', { minimumFractionDigits: 1 })} pts
              </div>
              <div className="text-[11px] text-neutral-500 font-mono">
                Treasury: ${Number(getMoney(third)).toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="order-3 hidden md:block" />
        )}
      </div>
    </div>
  );
};
