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
  const [durationMinutes, setDurationMinutes] = useState<number>(10);

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
      const started = await roundsApi.startRound(roundId, durationMinutes);
      success('Round Commenced', `Round #${started.round_number} is now LIVE for ${durationMinutes} minutes.`);
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
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-white/10 shadow-sm space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-neutral-100 dark:border-white/10 pb-4">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
            // Timeline Orchestration
          </span>
          <h3 className="font-display font-black text-2xl text-black dark:text-white mt-0.5">
            Round <span className="text-[#FF5533] dark:text-[#CCFF00]">Management</span>
          </h3>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-neutral-100 dark:bg-[#181818] border border-neutral-200 dark:border-white/10 rounded-2xl px-3.5 py-2 text-xs text-neutral-800 dark:text-neutral-200 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-[#FF5533] dark:text-[#CCFF00]" />
            <span className="font-semibold text-neutral-500">Duration:</span>
            <input
              type="number"
              min={1}
              max={60}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-14 bg-white dark:bg-[#0A0A0A] border border-neutral-300 dark:border-white/10 rounded-lg px-2 py-1 text-center font-mono font-bold text-black dark:text-white focus:outline-none focus:border-black dark:focus:border-[#CCFF00]"
            />
            <span className="text-neutral-500 font-mono">min</span>
          </div>

          <button
            onClick={handleCreateRound}
            disabled={isCreating || gameStatus?.is_finished}
            className="flex items-center gap-2 py-2.5 px-4 rounded-2xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black text-xs font-display font-bold uppercase tracking-wider transition-all disabled:opacity-40 shadow-sm"
          >
            {isCreating ? (
              <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span>Create Round #{nextRoundNumber}</span>
          </button>
        </div>
      </div>

      {allRounds.length === 0 ? (
        <div className="p-8 text-center bg-neutral-50 dark:bg-[#181818] rounded-2xl border border-neutral-200 dark:border-white/10 space-y-2">
          <Clock className="w-8 h-8 text-neutral-400 mx-auto" />
          <p className="text-sm font-display font-bold text-black dark:text-white">No Rounds Scheduled</p>
          <p className="text-xs text-neutral-500">
            Click "Create Round #1" to initiate the strategy timetable.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {allRounds.map((round) => {
            const isLoading = actionLoadingId === round.id;

            return (
              <div
                key={round.id}
                className={`p-5 rounded-2xl border transition-all ${
                  round.is_active
                    ? 'bg-neutral-50 dark:bg-[#181818] border-[#CCFF00]/50 shadow-[0_0_20px_rgba(204,255,0,0.15)]'
                    : 'bg-white dark:bg-[#111111] border-neutral-200 dark:border-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Zap
                      className={`w-4 h-4 ${
                        round.is_active ? 'text-black dark:text-[#CCFF00] fill-current' : 'text-neutral-400'
                      }`}
                    />
                    <span className="font-display font-black text-lg text-black dark:text-white">
                      Round #{round.round_number}
                    </span>
                  </div>
                  <StatusBadge status={round.is_active ? 'active' : 'inactive'} size="sm" />
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-white/5">
                  {round.is_active ? (
                    <button
                      onClick={() => handleEndRound(round.id)}
                      disabled={isLoading}
                      className="w-full py-2.5 px-3 rounded-xl bg-[#FF5533] hover:bg-[#E03D1B] text-white text-xs font-display font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      {isLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                      className="w-full py-2.5 px-3 rounded-xl bg-[#CCFF00] hover:bg-[#B8E600] text-black text-xs font-display font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                      {isLoading ? (
                        <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
