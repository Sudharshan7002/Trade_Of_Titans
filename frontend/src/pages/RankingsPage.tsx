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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
              // Global Standings
            </span>
            {isGameFinished ? (
              <span className="px-3 py-0.5 rounded-full text-[10px] font-display font-bold uppercase tracking-wider bg-[#FFD000] text-black shadow-sm">
                Official Final Results
              </span>
            ) : (
              <span className="px-3 py-0.5 rounded-full text-[10px] font-display font-bold uppercase tracking-wider bg-[#CCFF00] text-black shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
                Live Standings
              </span>
            )}
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-black dark:text-white mt-1 uppercase tracking-tight">
            Global Strategy <span className="text-[#FF5533] dark:text-[#CCFF00]">Leaderboard</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle between Live and Final if both available */}
          {finalRankings.length > 0 && (
            <div className="flex rounded-2xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-white/10 p-1">
              <button
                type="button"
                onClick={() => setViewMode('final')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all ${
                  viewMode === 'final'
                    ? 'bg-black text-[#CCFF00] dark:bg-[#CCFF00] dark:text-black shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Final Ceremony
              </button>
              <button
                type="button"
                onClick={() => setViewMode('live')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all ${
                  viewMode === 'live'
                    ? 'bg-black text-[#CCFF00] dark:bg-[#CCFF00] dark:text-black shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
                }`}
              >
                Live Metrics
              </button>
            </div>
          )}

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl bg-white dark:bg-[#111111] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all text-xs font-display font-bold flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#CCFF00]' : ''}`} />
            <span>Sync Scores</span>
          </button>
        </div>
      </div>

      {/* Podium Presentation for Top 3 */}
      <PodiumTopThree rankings={activeDisplayRankings} isFinal={viewMode === 'final'} />

      {/* Full Rankings Table */}
      <div className="space-y-4 pt-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
            // Full Classification
          </span>
          <h3 className="font-display font-bold text-2xl text-black dark:text-white">
            Comprehensive <span className="text-[#FF5533] dark:text-[#CCFF00]">Roster</span>
          </h3>
        </div>

        <GlassCard>
          <RankingsTable rankings={activeDisplayRankings} />
        </GlassCard>
      </div>
    </div>
  );
};
