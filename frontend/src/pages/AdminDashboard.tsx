import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../context/GameStateContext';
import { useToast } from '../context/ToastContext';
import { adminApi } from '../api/admin';
import { AdminDashboardData } from '../types/api';
import { StatCard } from '../components/ui/StatCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Skeleton } from '../components/ui/Skeleton';
import { GameControlPanel } from '../components/admin/GameControlPanel';
import { RoundManager } from '../components/admin/RoundManager';
import { CrisisInjector } from '../components/admin/CrisisInjector';
import { CountryManager } from '../components/admin/CountryManager';
import { MarketSetup } from '../components/admin/MarketSetup';
import { 
  ShieldCheck, 
  Building2, 
  RefreshCw, 
  Layers, 
  ArrowLeftRight,
  Flame,
  RotateCcw
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { gameStatus, refreshGameState } = useGameState();
  const { success, error: toastError } = useToast();

  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await adminApi.getDashboard();
      setData(res);
    } catch (err: any) {
      toastError('Failed to Load Admin Telemetry', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDashboard(), refreshGameState()]);
  };

  const handleResetTournament = async () => {
    const confirmed = window.confirm(
      "WARNING: Reset Tournament to Default Baseline?\n\n" +
      "This will permanently purge all test trades, crises, and round data, and reset all 15 nations and Standby Alpha (Black Market) to initial state with new secure credentials.\n\n" +
      "Click OK to execute full reset."
    );
    if (!confirmed) return;

    setIsResetting(true);
    try {
      await adminApi.resetTournament();
      success('Tournament Reset Successful', 'Database restored to clean default baseline.');
      await Promise.all([fetchDashboard(), refreshGameState()]);
    } catch (err: any) {
      toastError('Reset Failed', err.message || 'Could not reset tournament');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
        <Skeleton variant="table" count={4} />
      </div>
    );
  }

  const countries = data?.countries || [];
  const crises = data?.crises || [];
  const pendingTrades = data?.pending_trades || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
              // Supreme Command Console
            </span>
            <StatusBadge status="admin" size="sm" />
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-black dark:text-white mt-1 uppercase tracking-tight">
            Tournament <span className="text-[#FF5533] dark:text-[#CCFF00]">Administration</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetTournament}
            disabled={isResetting}
            className="px-4 py-2.5 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 transition-all text-xs font-display font-extrabold flex items-center gap-2 shadow-sm disabled:opacity-50"
            title="Reset tournament to clean default baseline"
          >
            <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset Tournament'}</span>
          </button>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl bg-white dark:bg-[#111111] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all text-xs font-display font-bold flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#CCFF00]' : ''}`} />
            <span>Sync Systems</span>
          </button>
        </div>
      </div>

      {/* Primary Telemetry Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tournament Status"
          value={
            gameStatus?.is_finished ? (
              <span className="text-[#FF5533] font-display text-xl font-black">CONCLUDED</span>
            ) : gameStatus?.is_started ? (
              <span className="text-black dark:text-[#CCFF00] font-display text-xl font-black">ACTIVE</span>
            ) : (
              <span className="text-neutral-400 font-display text-xl font-bold">STANDBY</span>
            )
          }
          icon={<ShieldCheck className="w-5 h-5" />}
          accentColor={gameStatus?.is_started ? 'emerald' : 'violet'}
          subtitle="Tournament lifecycle phase"
        />

        <StatCard
          label="Active Round"
          value={
            data?.active_round ? (
              <span className="font-mono text-black dark:text-[#CCFF00]">Round #{data.active_round.round_number}</span>
            ) : (
              <span className="text-neutral-500 text-lg font-display font-bold">No Active Round</span>
            )
          }
          icon={<ArrowLeftRight className="w-5 h-5" />}
          accentColor="cyan"
          subtitle="Current trading window"
        />

        <StatCard
          label="Enrolled States"
          value={countries.length}
          icon={<Building2 className="w-5 h-5" />}
          accentColor="gold"
          subtitle="Registered geopolitical nations"
        />

        <StatCard
          label="Pending Trades"
          value={pendingTrades.length}
          icon={<Layers className="w-5 h-5" />}
          accentColor="crimson"
          subtitle="Trades waiting in queue"
        />
      </div>

      {/* Main Operations & Roster Center: Asymmetric Two-Column Format */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (5 of 12 cols): Operations, Timeline & Volatility Command */}
        <div className="xl:col-span-5 space-y-8">
          {/* Tournament Lifecycle Controller (Start Game / End Game) */}
          <GameControlPanel onStateChanged={fetchDashboard} />

          {/* Round Management Orchestrator */}
          <RoundManager onRoundAction={fetchDashboard} />

          {/* Crisis Market Volatility Injector */}
          <CrisisInjector crises={crises} onCrisisInjected={fetchDashboard} />
        </div>

        {/* Right Column (7 of 12 cols): Sovereign Roster Table & Market Setup */}
        <div className="xl:col-span-7 space-y-8">
          {/* Sovereign Country Roster & Balances */}
          <CountryManager
            countries={countries as any}
            onCountryUpdated={fetchDashboard}
          />

          {/* Commodity Catalog, Stockpile Allocator & Objectives */}
          <MarketSetup />
        </div>
      </div>
    </div>
  );
};
