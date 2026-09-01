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
    <div className="min-h-screen flex flex-col bg-[#F6F8FB] dark:bg-titan-950 text-slate-900 dark:text-white transition-colors duration-200">
      <Navbar />

      {/* Global State Banner if Game Finished or Round Inactive */}
      {gameStatus?.is_finished ? (
        <div className="bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-500/40 py-2.5 px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-200 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" />
            <span>The Tournament Has Concluded — Final Rankings are Settled</span>
          </div>
        </div>
      ) : !gameStatus?.is_started ? (
        <div className="bg-slate-100 dark:bg-titan-900 border-b border-slate-200 dark:border-white/10 py-2 px-4 text-center">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Tournament is in standby. Awaiting Administrator initialization.
          </p>
        </div>
      ) : !activeRound ? (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-500/30 py-2 px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Intermission: No active trading round. Trading is temporarily locked.</span>
          </div>
        </div>
      ) : null}

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
        <div className="md:hidden mb-4 flex gap-2 overflow-x-auto subtle-scrollbar">
          <a
            href={workspacePath}
            className="shrink-0 rounded-xl bg-slate-900 dark:bg-white px-3.5 py-2 text-xs font-bold text-white dark:text-slate-950 shadow-sm"
          >
            Workspace
          </a>
        </div>
        <Outlet />
      </main>
    </div>
  );
};
