import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGameState } from '../context/GameStateContext';
import { useToast } from '../context/ToastContext';
import { rankingsApi } from '../api/rankings';
import { referenceApi } from '../api/reference';
import { LiveRanking, FinalRanking } from '../types/api';
import { PodiumTopThree } from '../components/rankings/PodiumTopThree';
import { RankingsTable } from '../components/rankings/RankingsTable';
import { GlassCard } from '../components/ui/GlassCard';
import { Skeleton } from '../components/ui/Skeleton';
import { RefreshCw } from 'lucide-react';

export const RankingsPage: React.FC = () => {
  const { role } = useAuth();
  const { gameStatus, refreshGameState } = useGameState();

  const [liveRankings, setLiveRankings] = useState<LiveRanking[]>([]);
  const [finalRankings, setFinalRankings] = useState<FinalRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'final' | 'live'>('live');

  const isGameFinished = !!gameStatus?.is_finished;

  const fetchRankings = useCallback(async () => {
    try {
      if (role === 'ranking' || role === 'admin') {
        const [liveRes, finalRes] = await Promise.allSettled([
          rankingsApi.getLiveRankings(),
          rankingsApi.getFinalRankings(),
        ]);

        if (liveRes.status === 'fulfilled') {
          setLiveRankings(liveRes.value.rankings || []);
        }
        if (finalRes.status === 'fulfilled') {
          setFinalRankings(finalRes.value || []);
        }
      } else {
        // If non-admin, countries list can be used for public standings overview
        const countries = await referenceApi.getCountries();
        const fallbackRankings: LiveRanking[] = countries
          .map((c) => ({
            country_id: c.id,
            country_name: c.name,
            money: c.money,
            score: Number(c.money),
            rank: 0,
          }))
          .sort((a, b) => b.score - a.score)
          .map((r, i) => ({ ...r, rank: i + 1 }));

        setLiveRankings(fallbackRankings);
      }
    } catch (err: any) {
      console.error('Error fetching rankings:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [role]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  useEffect(() => {
    if (isGameFinished && finalRankings.length > 0) {
      setViewMode('final');
    }
  }, [isGameFinished, finalRankings.length]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchRankings(), refreshGameState()]);
  };

  const activeDisplayRankings =
    viewMode === 'final' && finalRankings.length > 0 ? finalRankings : liveRankings;

  if (isLoading && activeDisplayRankings.length === 0) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" />
        <Skeleton variant="table" count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
              Global Geopolitical Standings
            </span>
            {isGameFinished ? (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Official Final Results
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Standings
              </span>
            )}
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-slate-950 dark:text-white mt-1">
            Global Strategy Leaderboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle between Live and Final if both available */}
          {finalRankings.length > 0 && (
            <div className="flex rounded-xl bg-slate-100 dark:bg-titan-900 border border-slate-200/80 dark:border-white/10 p-1">
              <button
                type="button"
                onClick={() => setViewMode('final')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'final'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                Final Ceremony
              </button>
              <button
                type="button"
                onClick={() => setViewMode('live')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'live'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                Live Metrics
              </button>
            </div>
          )}

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl bg-white dark:bg-titan-900 border border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-all text-xs font-semibold flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-sky-500' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Top 3 Champion Podium */}
      <PodiumTopThree
        rankings={activeDisplayRankings}
        isFinal={viewMode === 'final'}
      />

      {/* Full Leaderboard Table */}
      <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
              Full Standings
            </span>
            <h3 className="font-display font-bold text-xl text-slate-950 dark:text-white">
              Sovereign State Placements ({activeDisplayRankings.length})
            </h3>
          </div>
        </div>

        <GlassCard>
          <RankingsTable rankings={activeDisplayRankings} />
        </GlassCard>
      </div>
    </div>
  );
};
