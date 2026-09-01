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
      <div className="p-6 rounded-2xl glass-panel border border-white/10 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
              Global Lifecycle Command
            </span>
            <h3 className="font-display font-bold text-xl text-white mt-0.5">
              Tournament Master Controls
            </h3>
          </div>

          <div>
            {gameStatus?.is_finished ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-500/40">
                Tournament Concluded
              </span>
            ) : gameStatus?.is_started ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-glow-emerald/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Tournament Active
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                Not Started
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Start Game Action */}
          <div className="p-4 rounded-xl bg-titan-950/60 border border-white/5 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-white">
                <Play className="w-4 h-4 text-emerald-400" />
                <span>Initialize / Start Game</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Activates the game session, allowing round controllers and national delegates to initiate trades.
              </p>
            </div>

            <button
              onClick={gameStatus?.is_finished ? () => setIsConfirmResetOpen(true) : handleStartGame}
              disabled={isStarting || isResetting || gameStatus?.is_started}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-titan-950 font-black text-xs uppercase tracking-wider shadow-glow-emerald transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isStarting || isResetting ? (
                <div className="w-3.5 h-3.5 border-2 border-titan-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                gameStatus?.is_finished ? <RotateCcw className="w-4 h-4 text-titan-950" /> : <Play className="w-4 h-4 text-titan-950 fill-current" />
              )}
              <span>{gameStatus?.is_started ? 'Game Already Active' : gameStatus?.is_finished ? 'Prepare New Tournament' : 'Start Tournament'}</span>
            </button>
          </div>

          {/* End Game Action */}
          <div className="p-4 rounded-xl bg-titan-950/60 border border-rose-500/20 space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-rose-300">
                <Square className="w-4 h-4 text-rose-400" />
                <span>Conclude & Finalize Rankings</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Permanently closes the game, calculates final scores & standings, and generates the podium. Requires all rounds to be ended first.
              </p>
            </div>

            <button
              onClick={() => setIsConfirmEndOpen(true)}
              disabled={
                isEnding ||
                !gameStatus?.is_started ||
                gameStatus?.is_finished ||
                !!activeRound
              }
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-xs uppercase tracking-wider shadow-glow-crimson transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Conclude Game</span>
            </button>
          </div>
        </div>

        {activeRound && (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-300">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Round #{activeRound.round_number} is currently active. End the active round before concluding the tournament.
            </span>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={isConfirmEndOpen}
        onClose={() => setIsConfirmEndOpen(false)}
        onConfirm={handleEndGame}
        title="DANGER: Conclude Tournament & Finalize Rankings"
        message="Are you certain you wish to end the game? This will calculate all country scores (wealth, import objective bonuses, trade bonuses and penalties) and write the immutable Final Rankings to the database."
        confirmLabel="END GAME PERMANENTLY"
        isDangerous={true}
        isLoading={isEnding}
      />
      <ConfirmDialog
        isOpen={isConfirmResetOpen}
        onClose={() => setIsConfirmResetOpen(false)}
        onConfirm={handleResetGame}
        title="Prepare a New Tournament?"
        message="This reopens the game and deletes final rankings from the concluded tournament. Countries, resources, inventories, and rounds are retained."
        confirmLabel="RESET TO STANDBY"
        isDangerous
        isLoading={isResetting}
      />
    </>
  );
};
