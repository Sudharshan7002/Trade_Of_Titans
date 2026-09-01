import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useGameState } from '../../context/GameStateContext';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle, ShieldAlert } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { gameStatus, activeRound } = useGameState();
  const { role } = useAuth();
  const workspacePath = role === 'admin' ? '/admin' : role === 'trading_center' ? '/trading-center' : role === 'ranking' ? '/rankings' : '/country';

  return (
    <div className="min-h-screen flex flex-col bg-titan-950 text-white selection:bg-amber-500 selection:text-titan-950">
      <Navbar />

      {/* Global State Banner if Game Finished or Round Inactive */}
      {gameStatus?.is_finished ? (
        <div className="bg-titan-900 border-b border-amber-500/40 py-2.5 px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-bold text-rose-200 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>The Global Conflict Has Concluded — Final Rankings are Settled</span>
          </div>
        </div>
      ) : !gameStatus?.is_started ? (
        <div className="bg-titan-900 border-b border-white/10 py-2 px-4 text-center">
          <p className="text-xs font-medium text-slate-400">
            Game is in standby. Awaiting Supreme Admin initialization.
          </p>
        </div>
      ) : !activeRound ? (
        <div className="bg-titan-900 border-b border-amber-500/30 py-2 px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-300">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Inter-Round Ceasefire: No active trading round. Trading is temporarily locked.</span>
          </div>
        </div>
      ) : null}

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
        <div className="md:hidden mb-5 flex gap-2 overflow-x-auto subtle-scrollbar">
          <a href={workspacePath} className="shrink-0 rounded-lg bg-amber-500 px-3 py-2 text-xs font-bold text-titan-950">Workspace</a>
        </div>
        <Outlet />
      </main>
    </div>
  );
};
