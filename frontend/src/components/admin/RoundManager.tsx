import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { useToast } from '../../context/ToastContext';
import { roundsApi } from '../../api/rounds';
import { Plus, Play, Square, Zap, Clock } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

interface RoundManagerProps {
  onRoundAction: () => void;
}

export const RoundManager: React.FC<RoundManagerProps> = ({ onRoundAction }) => {
  const { allRounds, activeRound, gameStatus, refreshGameState } = useGameState();
  const { success, error: toastError } = useToast();

  const [isCreating, setIsCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // Next round number calculation
  const nextRoundNumber =
    allRounds.length > 0 ? Math.max(...allRounds.map((r) => r.round_number)) + 1 : 1;

  const handleCreateRound = async () => {
    setIsCreating(true);
    try {
      const created = await roundsApi.createRound(nextRoundNumber);
      success('Round Created', `Round #${created.round_number} is ready for activation.`);
      await refreshGameState();
      onRoundAction();
    } catch (err: any) {
      toastError('Failed to Create Round', err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStartRound = async (roundId: number) => {
    setActionLoadingId(roundId);
    try {
      const started = await roundsApi.startRound(roundId);
      success('Round Commenced', `Round #${started.round_number} is now LIVE.`);
      await refreshGameState();
      onRoundAction();
    } catch (err: any) {
      toastError('Failed to Start Round', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleEndRound = async (roundId: number) => {
    setActionLoadingId(roundId);
    try {
      const ended = await roundsApi.endRound(roundId);
      success('Round Ended', `Round #${ended.round_number} has concluded.`);
      await refreshGameState();
      onRoundAction();
    } catch (err: any) {
      toastError('Failed to End Round', err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
            Timeline Orchestration
          </span>
          <h3 className="font-display font-bold text-xl text-white mt-0.5">Round Management</h3>
        </div>

        <button
          onClick={handleCreateRound}
          disabled={isCreating || gameStatus?.is_finished}
          className="flex items-center gap-2 py-2 px-4 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40"
        >
          {isCreating ? (
            <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          <span>Create Round #{nextRoundNumber}</span>
        </button>
      </div>

      {allRounds.length === 0 ? (
        <div className="p-8 text-center glass-card rounded-xl border border-white/5 space-y-2">
          <Clock className="w-8 h-8 text-slate-500 mx-auto" />
          <p className="text-sm font-semibold text-slate-300">No Rounds Scheduled</p>
          <p className="text-xs text-slate-500">
            Click "Create Round #1" to initiate the strategy timetable.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {allRounds.map((round) => {
            const isLoading = actionLoadingId === round.id;

            return (
              <div
                key={round.id}
                className={`p-4 rounded-xl border transition-all ${
                  round.is_active
                    ? 'bg-titan-900/90 border-cyan-500/40 shadow-glow-cyan/20'
                    : 'bg-titan-950/60 border-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap
                      className={`w-4 h-4 ${
                        round.is_active ? 'text-amber-400 fill-amber-400' : 'text-slate-500'
                      }`}
                    />
                    <span className="font-display font-black text-lg text-white">
                      Round #{round.round_number}
                    </span>
                  </div>
                  <StatusBadge status={round.is_active ? 'active' : 'inactive'} size="sm" />
                </div>

                <div className="pt-2 border-t border-white/5">
                  {round.is_active ? (
                    <button
                      onClick={() => handleEndRound(round.id)}
                      disabled={isLoading}
                      className="w-full py-2 px-3 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                    >
                      {isLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Square className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>End Round</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartRound(round.id)}
                      disabled={
                        isLoading ||
                        !gameStatus?.is_started ||
                        gameStatus?.is_finished ||
                        !!activeRound
                      }
                      className="w-full py-2 px-3 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>Start Round</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
