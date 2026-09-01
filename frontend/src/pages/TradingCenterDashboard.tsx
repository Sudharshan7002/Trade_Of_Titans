import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../context/GameStateContext';
import { useToast } from '../context/ToastContext';
import { tradingCenterApi } from '../api/tradingCenter';
import { TradingCenterDashboardData } from '../types/api';
import { StatCard } from '../components/ui/StatCard';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Skeleton } from '../components/ui/Skeleton';
import { PendingTradeQueue } from '../components/tradingCenter/PendingTradeQueue';
import { CompletedTradesFeed } from '../components/tradingCenter/CompletedTradesFeed';
import { DirectTradeDesk } from '../components/tradingCenter/DirectTradeDesk';
import { 
  ArrowLeftRight, 
  Clock, 
  CheckCircle2, 
  RefreshCw, 
  Flame
} from 'lucide-react';

export const TradingCenterDashboard: React.FC = () => {
  const { gameStatus, refreshGameState, getResourceName } = useGameState();
  const { error: toastError } = useToast();

  const [data, setData] = useState<TradingCenterDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await tradingCenterApi.getDashboard();
      setData(res);
    } catch (err: any) {
      toastError('Failed to Load Trading Floor Telemetry', err.message);
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

  const isExecutable =
    !!gameStatus?.is_started && !gameStatus?.is_finished && !!data?.active_round;

  if (isLoading && !data) {
    return (
      <div className="space-y-6">
        <Skeleton variant="card" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
        <Skeleton variant="table" count={4} />
      </div>
    );
  }

  const pendingTrades = data?.pending_trades || [];
  const completedTrades = data?.recent_completed_trades || [];
  const crises = data?.crises || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
              // International Settlement Bureau
            </span>
            <StatusBadge status="trading_center" size="sm" />
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-black dark:text-white mt-1 uppercase tracking-tight">
            Trading Center <span className="text-[#FF5533] dark:text-[#CCFF00]">Terminal</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl bg-white dark:bg-[#111111] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all text-xs font-display font-bold flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#CCFF00]' : ''}`} />
            <span>Sync Market Queue</span>
          </button>
        </div>
      </div>

      {/* Primary Settlement Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Pending Queue Volume"
          value={pendingTrades.length}
          icon={<Clock className="w-5 h-5" />}
          accentColor="gold"
          subtitle="Proposals awaiting settlement"
        />

        <StatCard
          label="Active Round"
          value={
            data?.active_round ? (
              <span className="font-mono text-black dark:text-[#CCFF00]">Round #{data.active_round.round_number}</span>
            ) : (
              <span className="text-neutral-500 text-lg font-display font-bold">Trading Ceasefire</span>
            )
          }
          icon={<ArrowLeftRight className="w-5 h-5" />}
          accentColor="cyan"
          subtitle={
            data?.active_round ? 'Order execution permitted' : 'Execution temporarily halted'
          }
        />

        <StatCard
          label="Historical Settlements"
          value={completedTrades.length}
          icon={<CheckCircle2 className="w-5 h-5" />}
          accentColor="emerald"
          subtitle="Settled transactions audited"
        />

        <StatCard
          label="Market Volatility Alerts"
          value={crises.length}
          icon={<Flame className="w-5 h-5" />}
          accentColor="crimson"
          subtitle="Active price modifiers this round"
        />
      </div>

      {/* Market Volatility Notice (if crises active) */}
      {crises.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FF5533]/10 border border-[#FF5533]/30 flex items-center justify-between gap-4 flex-wrap shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF5533] text-white shrink-0 shadow-sm animate-pulse">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-black dark:text-white">
                Active Round Geopolitical Crisis
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                Ensure trades reflect current commodity values when auditing deals.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {crises.map((c, i) => {
              const resName = getResourceName(c.resource_id);
              const isBoom = c.value_modifier >= 1.0;
              return (
                <span
                  key={i}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-display font-bold border ${
                    isBoom
                      ? 'bg-[#CCFF00] text-black border-[#A3CC00]'
                      : 'bg-[#FF5533] text-white border-[#E03D1B]'
                  }`}
                >
                  {resName}: {c.value_modifier}x {isBoom ? '(+)' : '(-)'}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Direct Settlement & Trade Execution Desk */}
      <DirectTradeDesk
        activeRoundId={data?.active_round?.id}
        isExecutable={isExecutable}
        countriesIntel={data?.countries_intel}
        onTradeExecuted={fetchDashboard}
      />

      {/* Pending Trade Queue with Confirm Action (if any pending trades exist) */}
      {pendingTrades.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
                // Action Required
              </span>
              <h3 className="font-display font-bold text-2xl text-black dark:text-white">
                Pending Trade <span className="text-[#FF5533] dark:text-[#CCFF00]">Queue</span> ({pendingTrades.length})
              </h3>
            </div>
          </div>

          <PendingTradeQueue
            pendingTrades={pendingTrades}
            isExecutable={isExecutable}
            onTradeConfirmed={fetchDashboard}
          />
        </div>
      )}

      {/* Completed Settlements Feed */}
      <div className="space-y-4 pt-6 border-t border-neutral-200/80 dark:border-white/10">
        <div>
          <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
            // Audited Ledger
          </span>
          <h3 className="font-display font-bold text-2xl text-black dark:text-white">
            Recent Executed <span className="text-[#FF5533] dark:text-[#CCFF00]">Settlements</span>
          </h3>
        </div>

        <GlassCard>
          <CompletedTradesFeed completedTrades={completedTrades} />
        </GlassCard>
      </div>
    </div>
  );
};
