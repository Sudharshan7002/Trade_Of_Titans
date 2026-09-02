import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../context/GameStateContext';
import { useToast } from '../context/ToastContext';
import { countryApi } from '../api/country';
import { CountryDashboardData } from '../types/api';
import { StatCard } from '../components/ui/StatCard';
import { GlassCard } from '../components/ui/GlassCard';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Skeleton } from '../components/ui/Skeleton';
import { InventoryGrid } from '../components/country/InventoryGrid';
import { ObjectivesList } from '../components/country/ObjectivesList';
import { CountryTradeHistory } from '../components/country/CountryTradeHistory';
import { QuotaProgressRing } from '../components/country/QuotaProgressRing';
import { 
  DollarSign, 
  Package, 
  Target, 
  ArrowLeftRight, 
  RefreshCw,
  Flame
} from 'lucide-react';

export const CountryDashboard: React.FC = () => {
  const { refreshGameState, getResourceName } = useGameState();
  const { error: toastError } = useToast();

  const [data, setData] = useState<CountryDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboard = useCallback(async (isManual = false) => {
    try {
      const res = await countryApi.getDashboard();
      setData(res);
    } catch (err: any) {
      if (isManual) {
        toastError('Failed to Load Country Data', err.message);
      } else {
        console.warn('Background country sync notice:', err.message);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchDashboard(false);

    let timeoutId: any;
    let isCancelled = false;

    const scheduleNextPoll = () => {
      if (isCancelled) return;

      // Base cadence: 20s when round is active, 35s during intermission
      const baseMs = data?.active_round ? 20000 : 35000;
      // Add +/- 3000ms random jitter to spread 30 concurrent user requests smoothly
      const jitterMs = Math.floor((Math.random() - 0.5) * 6000);
      const delay = Math.max(14000, baseMs + jitterMs);

      timeoutId = setTimeout(async () => {
        if (!document.hidden && !isCancelled) {
          await fetchDashboard(false);
        }
        scheduleNextPoll();
      }, delay);
    };

    scheduleNextPoll();

    const handleVisibilityChange = () => {
      if (!document.hidden && !isCancelled) {
        fetchDashboard(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchDashboard, Boolean(data?.active_round)]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchDashboard(true), refreshGameState()]);
  };

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

  const country = data?.country;
  const inventory = data?.inventory || [];
  const objectives = data?.objectives || [];
  const crises = data?.crises || [];
  const trades = data?.trades || [];

  return (
    <div className="space-y-8">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
              // National Operations Console
            </span>
            <StatusBadge status="country" size="sm" />
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-black dark:text-white mt-1 uppercase tracking-tight">
            {country?.name || 'Sovereign Delegate'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl bg-white dark:bg-[#111111] border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-all text-xs font-display font-bold flex items-center gap-2 shadow-sm"
            title="Refresh dashboard telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#CCFF00]' : ''}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>
        </div>
      </div>

      {/* Sovereign Spotlight: Host Nation Card */}
      {data?.active_round && data?.spotlight && data.spotlight.is_host && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-600/20 border-2 border-amber-400/50 dark:border-amber-400/40 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-[11px] font-mono font-black uppercase tracking-wider bg-amber-400 text-black shadow-sm">
                  ⭐ Round #{data.active_round.round_number} Global Host Nation
                </span>
                <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-300">
                  // {data.spotlight.title}
                </span>
              </div>
              <h3 className="font-display font-black text-xl sm:text-2xl text-black dark:text-white">
                Your Sovereign Spotlight is Active
              </h3>
              <p className="text-sm text-neutral-800 dark:text-neutral-200 font-medium">
                <strong className="text-black dark:text-amber-300">Active Doctrine Perk: </strong>
                {data.spotlight.perk}
              </p>
            </div>

            <div
              className={`p-4 rounded-2xl border shrink-0 space-y-1 max-w-sm ${
                data.spotlight.bounty_claimed
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-900 dark:text-emerald-200'
                  : 'bg-white/90 dark:bg-black/50 border-amber-400/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                  🎯 Bonus Round Mission
                </span>
                {data.spotlight.bounty_claimed && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500 text-black">
                    AWARDED ✓
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-800 dark:text-neutral-200 font-semibold">
                {data.spotlight.bonus_objective}
              </p>
              <span
                className={`inline-block mt-1 text-[11px] font-mono font-bold ${
                  data.spotlight.bounty_claimed
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-300'
                }`}
              >
                {data.spotlight.bounty_claimed ? 'Claimed: ' : 'Bounty: '}
                {data.spotlight.reward}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sovereign Spotlight: Global Alert for Other Nations */}
      {data?.active_round && data?.spotlight && !data.spotlight.is_host && (
        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-[#151515] border border-neutral-200 dark:border-white/10 flex items-center justify-between gap-4 flex-wrap text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-400/30">
              ⭐ Spotlight Nation
            </span>
            <span className="font-display font-bold text-black dark:text-white">
              {data.spotlight.country_name} — <span className="text-neutral-600 dark:text-neutral-300">{data.spotlight.title}</span>
            </span>
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-300 font-mono">
            Active Doctrine: <strong className="text-black dark:text-white">{data.spotlight.perk}</strong>
          </div>
        </div>
      )}

      {/* Round Turn Status Telemetry */}
      {data?.active_round && data?.trade_eligibility && (
        <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-[#151515] border border-neutral-200/90 dark:border-white/10 flex items-center justify-between gap-4 flex-wrap text-xs shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-mono text-neutral-500 uppercase font-bold tracking-wider">
              // Round #{data.active_round.round_number} Trading Quotas:
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Export Turn */}
            <div
              className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 border ${
                data.trade_eligibility.can_export
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 border-neutral-300 dark:border-white/10'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  data.trade_eligibility.can_export ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                }`}
              />
              <span>
                Export Quota:{' '}
                {data.trade_eligibility.can_export
                  ? `Available (${data.trade_eligibility.max_exports ? (data.trade_eligibility.max_exports - (data.trade_eligibility.export_count || 0)) : 1}/${data.trade_eligibility.max_exports || 1})`
                  : `Completed (${data.trade_eligibility.max_exports || 1}/${data.trade_eligibility.max_exports || 1}) ✓`}
              </span>
            </div>

            {/* Import Turn */}
            <div
              className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs flex items-center gap-1.5 border ${
                data.trade_eligibility.can_import
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500 border-neutral-300 dark:border-white/10'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  data.trade_eligibility.can_import ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
                }`}
              />
              <span>
                Import Quota:{' '}
                {data.trade_eligibility.can_import
                  ? `Available (${data.trade_eligibility.max_imports ? (data.trade_eligibility.max_imports - (data.trade_eligibility.import_count || 0)) : 1}/${data.trade_eligibility.max_imports || 1})`
                  : `Completed (${data.trade_eligibility.max_imports || 1}/${data.trade_eligibility.max_imports || 1}) ✓`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Primary Financial & Round Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Treasury Reserves */}
        <StatCard
          label="Treasury Reserves"
          value={`$${Number(country?.money || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={<DollarSign className="w-5 h-5" />}
          accentColor="emerald"
          subtitle="Liquid national fiat balance"
        />

        {/* Current Round */}
        <StatCard
          label="Current Game Round"
          value={
            data?.active_round ? (
              <span className="font-mono text-black dark:text-[#CCFF00]">Round #{data.active_round.round_number}</span>
            ) : (
              <span className="text-neutral-500 text-xl font-display font-bold">Intermission</span>
            )
          }
          icon={<ArrowLeftRight className="w-5 h-5" />}
          accentColor="cyan"
          subtitle={
            data?.active_round
              ? 'Active commercial trading window'
              : 'Market closed between rounds'
          }
        />

        {/* Stockpile Units */}
        <StatCard
          label="Stockpile Volume"
          value={`${inventory.reduce((acc, i) => acc + i.quantity, 0).toLocaleString()} u`}
          icon={<Package className="w-5 h-5" />}
          accentColor="violet"
          subtitle={`${inventory.length} resource categories stored`}
        />

        {/* Objectives Fulfillment */}
        <StatCard
          label="Import Target Quota"
          value={
            objectives.length > 0
              ? `${objectives.filter((o) => o.imported_quantity >= o.required_quantity).length} / ${
                  objectives.length
                }`
              : '0 / 0'
          }
          icon={<Target className="w-5 h-5" />}
          accentColor="gold"
          subtitle="Strategic quotas completed"
        />
      </div>

      {/* Active Crises Alert Bar (if any in round) */}
      {crises.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FF5533]/10 border border-[#FF5533]/30 flex items-center justify-between gap-4 flex-wrap shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#FF5533] text-white shrink-0 shadow-sm animate-pulse">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-black dark:text-white">
                Active Round Market Crisis Detected
              </h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                Resource values are actively altered by geopolitical events this round.
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

      {/* Strategic Import Quotas Progress Ring & Badges */}
      <QuotaProgressRing objectives={objectives} getResourceName={getResourceName} />

      {/* Main Grid: Inventory Stockpiles & Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Resource Stockpiles & Valuations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
                // 01 Inventory Stock
              </span>
              <h3 className="font-display font-bold text-2xl text-black dark:text-white">
                National <span className="text-[#FF5533] dark:text-[#CCFF00]">Stockpiles</span>
              </h3>
            </div>
          </div>

          <InventoryGrid
            inventory={inventory}
            crises={crises}
            canExport={false}
          />
        </div>

        {/* Right 1 Col: Strategic Import Objectives */}
        <div className="space-y-4">
          <div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
              // 02 Targets
            </span>
            <h3 className="font-display font-bold text-2xl text-black dark:text-white">
              Import <span className="text-[#FF5533] dark:text-[#CCFF00]">Objectives</span>
            </h3>
          </div>

          <ObjectivesList
            objectives={objectives}
            canImport={false}
          />
        </div>
      </div>

      {/* Sovereign Trade Ledger */}
      <div className="space-y-4 pt-6 border-t border-neutral-200/80 dark:border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
              // 03 Audited Ledger
            </span>
            <h3 className="font-display font-bold text-2xl text-black dark:text-white">
              Sovereign <span className="text-[#FF5533] dark:text-[#CCFF00]">Trade History</span>
            </h3>
          </div>
        </div>

        <GlassCard>
          <CountryTradeHistory
            trades={trades}
            myCountryId={country?.id || 0}
          />
        </GlassCard>
      </div>
    </div>
  );
};
