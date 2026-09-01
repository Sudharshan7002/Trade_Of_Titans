import React from 'react';
import { Crown, Sparkles } from 'lucide-react';
import { LiveRanking, FinalRanking } from '../../types/api';

interface PodiumTopThreeProps {
  rankings: Array<LiveRanking | FinalRanking>;
  isFinal?: boolean;
}

export const PodiumTopThree: React.FC<PodiumTopThreeProps> = ({
  rankings,
  isFinal = false,
}) => {
  if (!rankings || rankings.length === 0) return null;

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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black uppercase tracking-widest shadow-glow-gold animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Grand Victory Ceremony</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
            Hall of Sovereign Titans
          </h2>
          <p className="text-sm text-slate-400 max-w-lg mx-auto">
            Official strategic scores settled across geopolitical trading efficiency, gross national wealth, and quota fulfillment.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end max-w-4xl mx-auto">
        {/* 2nd Place - Silver */}
        {second ? (
          <div className="order-2 md:order-1 glass-panel rounded-2xl p-5 border border-slate-400/30 bg-titan-900/90 flex flex-col items-center text-center shadow-lg relative group hover:border-slate-300 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-slate-300/10 border border-slate-300/30 flex items-center justify-center text-slate-300 text-xl font-black mb-3">
              🥈
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">
              2nd Place (Silver)
            </span>
            <h3 className="font-display font-black text-xl text-white mt-1 truncate max-w-full">
              {second.country_name}
            </h3>
            <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5 w-full space-y-1">
              <div className="text-xs text-slate-400">Total Score</div>
              <div className="font-mono font-bold text-lg text-slate-200">
                {Number(second.score).toLocaleString('en-US', { minimumFractionDigits: 1 })} pts
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
                Treasury: ${Number(getMoney(second)).toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="order-2 md:order-1 hidden md:block" />
        )}

        {/* 1st Place - Gold (Grand Champion) */}
        {first ? (
          <div className="order-1 md:order-2 glass-panel rounded-2xl p-6 border-2 border-amber-500/50 bg-gradient-to-b from-amber-950/40 via-titan-900/95 to-titan-950 flex flex-col items-center text-center shadow-glow-gold relative group md:-translate-y-4">
            <div className="absolute -top-5 flex items-center justify-center p-2 rounded-xl bg-amber-500 text-titan-950 shadow-glow-gold">
              <Crown className="w-6 h-6 fill-titan-950" />
            </div>
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 text-3xl font-black mb-3 mt-2">
              🥇
            </div>
            <span className="text-xs font-mono font-black uppercase tracking-widest text-amber-400">
              Supreme Champion (1st)
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-amber-200 mt-1 truncate max-w-full">
              {first.country_name}
            </h3>
            <div className="mt-4 p-4 rounded-xl bg-black/50 border border-amber-500/20 w-full space-y-1.5">
              <div className="text-xs font-bold uppercase tracking-wider text-amber-400/80">
                Championship Score
              </div>
              <div className="font-mono font-black text-2xl sm:text-3xl text-amber-300">
                {Number(first.score).toLocaleString('en-US', { minimumFractionDigits: 1 })} pts
              </div>
              <div className="text-xs text-amber-200/70 font-mono">
                Treasury: ${Number(getMoney(first)).toLocaleString()}
              </div>
            </div>
          </div>
        ) : (
          <div className="order-1 md:order-2 hidden md:block" />
        )}

        {/* 3rd Place - Bronze */}
        {third ? (
          <div className="order-3 glass-panel rounded-2xl p-5 border border-amber-700/30 bg-titan-900/90 flex flex-col items-center text-center shadow-lg relative group hover:border-amber-700/50 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-700/10 border border-amber-700/30 flex items-center justify-center text-amber-600 text-xl font-black mb-3">
              🥉
            </div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-600">
              3rd Place (Bronze)
            </span>
            <h3 className="font-display font-black text-xl text-white mt-1 truncate max-w-full">
              {third.country_name}
            </h3>
            <div className="mt-3 p-3 rounded-xl bg-black/40 border border-white/5 w-full space-y-1">
              <div className="text-xs text-slate-400">Total Score</div>
              <div className="font-mono font-bold text-lg text-amber-600">
                {Number(third.score).toLocaleString('en-US', { minimumFractionDigits: 1 })} pts
              </div>
              <div className="text-[11px] text-slate-500 font-mono">
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
