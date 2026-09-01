import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useGameState } from '../../context/GameStateContext';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { gameStatus, activeRound } = useGameState();
  const { role } = useAuth();
  const workspacePath =
    role === 'admin'
      ? '/admin'
      : role === 'trading_center'
      ? '/trading-center'
      : role === 'ranking'
      ? '/rankings'
      : '/country';

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-200"
      style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)' }}
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-4">
        <Navbar />

        {/* Global State Banner if Game Finished or Round Inactive */}
        {gameStatus?.is_finished ? (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-center backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-center gap-2 text-xs font-display font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span>The Tournament Has Concluded — Final Rankings are Settled</span>
            </div>
          </div>
        ) : !gameStatus?.is_started ? (
          <div className="mb-4 p-3 rounded-2xl bg-neutral-200/60 dark:bg-neutral-900 border border-neutral-300/80 dark:border-white/10 text-center backdrop-blur-md shadow-sm">
            <p className="text-xs font-mono font-medium text-neutral-600 dark:text-neutral-400">
              // Standby Mode: Awaiting Administrator initialization.
            </p>
          </div>
        ) : !activeRound ? (
          <div className="mb-4 p-3 rounded-2xl bg-[#FF5533]/10 border border-[#FF5533]/30 text-center backdrop-blur-md shadow-sm">
            <div className="flex items-center justify-center gap-2 text-xs font-display font-bold text-[#FF5533]">
              <AlertCircle className="w-4 h-4" />
              <span>Intermission: No active trading round. Commercial orders are temporarily locked.</span>
            </div>
          </div>
        ) : null}

        {/* Nested Main Canvas Sheet (Image 3) */}
        <main className="nested-canvas-sheet p-6 sm:p-8 mb-8">
          <div className="md:hidden mb-6 flex gap-2 overflow-x-auto subtle-scrollbar">
            <a
              href={workspacePath}
              className="btn-lime py-2 px-4 text-xs font-display font-bold shadow-sm"
            >
              Go to Workspace
            </a>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
