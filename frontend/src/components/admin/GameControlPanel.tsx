import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { useToast } from '../../context/ToastContext';
import { gameApi } from '../../api/game';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Play, Square, AlertTriangle, RotateCcw } from 'lucide-react';

interface GameControlPanelProps {
  onStateChanged: () => void;
}

export const GameControlPanel: React.FC<GameControlPanelProps> = ({ onStateChanged }) => {
  const { gameStatus, activeRound, refreshGameState } = useGameState();
  const { success, error: toastError } = useToast();

  const [isStarting, setIsStarting] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isConfirmEndOpen, setIsConfirmEndOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isConfirmResetOpen, setIsConfirmResetOpen] = useState(false);

  const handleStartGame = async () => {
    setIsStarting(true);
    try {
      await gameApi.startGame();
      success('Global Game Initialized', 'Trade of Titans game session is now LIVE.');
      await refreshGameState();
      onStateChanged();
    } catch (err: any) {
      toastError('Failed to Start Game', err.message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleEndGame = async () => {
    setIsEnding(true);
    try {
      const res = await gameApi.endGame();
      success(
        'Game Concluded & Final Rankings Locked',
        res.winner ? `Champion: ${res.winner.country_name}` : 'Final rankings generated.'
      );
      setIsConfirmEndOpen(false);
      await refreshGameState();
      onStateChanged();
    } catch (err: any) {
      toastError('Failed to End Game', err.message);
    } finally {
      setIsEnding(false);
    }
  };

  const handleResetGame = async () => {
    setIsResetting(true);
    try {
      await gameApi.resetGame();
      success('Tournament Reset', 'The game is in standby and ready to start again.');
      setIsConfirmResetOpen(false);
      await refreshGameState();
      onStateChanged();
    } catch (err: any) {
      toastError('Failed to Reset Tournament', err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-white/10 shadow-sm space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3 border-b border-neutral-100 dark:border-white/10 pb-4">
          <div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
              // Global Lifecycle Command
            </span>
            <h3 className="font-display font-black text-2xl text-black dark:text-white mt-0.5">
              Tournament <span className="text-[#FF5533] dark:text-[#CCFF00]">Master Controls</span>
            </h3>
          </div>

          <div>
            {gameStatus?.is_finished ? (
              <span className="px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider bg-[#FF5533] text-white shadow-sm">
                Tournament Concluded
              </span>
            ) : gameStatus?.is_started ? (
              <span className="px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider bg-[#CCFF00] text-black shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                Tournament Active
              </span>
            ) : (
              <span className="px-3 py-1 rounded-full text-xs font-display font-bold uppercase tracking-wider bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300">
                Not Started
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Game Action */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/90 dark:border-white/10 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-display font-bold text-sm text-black dark:text-white">
                <Play className="w-4 h-4 text-black dark:text-[#CCFF00] fill-current" />
                <span>Initialize / Start Tournament</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                Activates the session, allowing round controllers and national delegates to initiate trades.
              </p>
            </div>

            <button
              onClick={gameStatus?.is_finished ? () => setIsConfirmResetOpen(true) : handleStartGame}
              disabled={isStarting || isResetting || gameStatus?.is_started}
              className="w-full py-3 px-4 rounded-xl bg-black hover:bg-neutral-800 dark:bg-[#CCFF00] dark:hover:bg-[#B8E600] text-white dark:text-black font-display font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isStarting || isResetting ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                gameStatus?.is_finished ? <RotateCcw className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />
              )}
              <span>{gameStatus?.is_started ? 'Game Already Active' : gameStatus?.is_finished ? 'Prepare New Tournament' : 'Start Tournament'}</span>
            </button>
          </div>

          {/* End Game Action */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/90 dark:border-white/10 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-display font-bold text-sm text-[#FF5533]">
                <Square className="w-4 h-4 text-[#FF5533] fill-current" />
                <span>Conclude & Finalize Rankings</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
                Permanently closes the tournament, calculates final scores, and generates the podium.
              </p>
            </div>

            <button
              onClick={() => setIsConfirmEndOpen(true)}
              disabled={isEnding || !gameStatus?.is_started || gameStatus?.is_finished || !!activeRound}
              className="w-full py-3 px-4 rounded-xl bg-[#FF5533] hover:bg-[#E03D1B] text-white font-display font-extrabold text-xs uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
            >
              {isEnding ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Square className="w-4 h-4 fill-current" />
              )}
              <span>{activeRound ? 'Cannot End (Active Round)' : 'Conclude & Finalize'}</span>
            </button>
          </div>
        </div>

        {activeRound && (
          <div className="p-3.5 rounded-2xl bg-[#FF5533]/15 border border-[#FF5533]/40 flex items-center gap-2.5 text-xs text-[#FF5533]">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Round #{activeRound.round_number} is currently active. End the active round before concluding the tournament.
            </span>
          </div>
        )}
      </div>

      {/* Confirmation Dialog for Concluding Tournament */}
      <ConfirmDialog
        isOpen={isConfirmEndOpen}
        onClose={() => setIsConfirmEndOpen(false)}
        onConfirm={handleEndGame}
        title="Conclude Tournament & Generate Final Rankings"
        message="This action will permanently lock the tournament, conclude all trade transactions, and compute the official sovereign leaderboard. Are you sure you wish to finalize the competition?"
        confirmLabel="Finalize & Lock Tournament"
        isDangerous={true}
        isLoading={isEnding}
      />

      {/* Confirmation Dialog for Resetting Tournament */}
      <ConfirmDialog
        isOpen={isConfirmResetOpen}
        onClose={() => setIsConfirmResetOpen(false)}
        onConfirm={handleResetGame}
        title="Prepare New Tournament"
        message="This will reset game state back to standby mode so you can start a new tournament. Existing country rosters and resources are preserved."
        confirmLabel="Reset to Standby"
        isDangerous={false}
        isLoading={isResetting}
      />
    </>
  );
};
