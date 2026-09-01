import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../context/GameStateContext';
import { useToast } from '../context/ToastContext';
import { adminApi } from '../api/admin';
import { AdminDashboardData } from '../types/api';
import { StatCard } from '../components/ui/StatCard';
import { GlassCard } from '../components/ui/GlassCard';
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
  ArrowLeftRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { gameStatus, refreshGameState } = useGameState();
  const { error: toastError } = useToast();

  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
              Supreme Command Console
            </span>
            <StatusBadge status="admin" size="sm" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
            Tournament Administration
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl glass-panel border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
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
              <span className="text-rose-400 font-mono text-xl font-black">CONCLUDED</span>
            ) : gameStatus?.is_started ? (
              <span className="text-emerald-400 font-mono text-xl font-black">ACTIVE</span>
            ) : (
              <span className="text-slate-400 font-mono text-xl font-bold">STANDBY</span>
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
              <span className="font-mono text-cyan-400">Round #{data.active_round.round_number}</span>
            ) : (
              <span className="text-slate-500 text-lg font-bold">No Active Round</span>
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

      {/* Tournament Lifecycle Controller (Start Game / End Game) */}
      <GameControlPanel onStateChanged={fetchDashboard} />

      {/* Round Management Orchestrator */}
      <RoundManager onRoundAction={fetchDashboard} />

      {/* Crisis Market Volatility Injector */}
      <CrisisInjector crises={crises} onCrisisInjected={fetchDashboard} />

      {/* Sovereign Country Roster & Balances */}
      <CountryManager
        countries={countries as any}
        onCountryUpdated={fetchDashboard}
      />

      <MarketSetup />
    </div>
  );
};
