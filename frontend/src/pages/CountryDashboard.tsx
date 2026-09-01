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

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await countryApi.getDashboard();
      setData(res);
    } catch (err: any) {
      toastError('Failed to Load Country Data', err.message);
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

  const isRoundActive = !!data?.active_round;

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
              National Operations Console
            </span>
            <StatusBadge status="country" size="sm" />
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
            {country?.name || 'Sovereign Delegate'}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="p-2.5 rounded-xl glass-panel border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all text-xs font-semibold flex items-center gap-2"
            title="Refresh dashboard telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>
        </div>
      </div>

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
              <span className="font-mono text-cyan-400">Round #{data.active_round.round_number}</span>
            ) : (
              <span className="text-slate-500 text-xl font-bold">Intermission</span>
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
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-titan-900/80 to-rose-950/40 border border-amber-500/30 flex items-center justify-between gap-4 flex-wrap shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-display font-bold text-sm text-white">
                Active Round Market Crisis Detected
              </h4>
              <p className="text-xs text-slate-300">
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold font-mono border ${
                    isBoom
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {resName}: {c.value_modifier}x {isBoom ? '(+)' : '(-)'}
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Inventory Stockpiles & Objectives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Resource Stockpiles & Valuations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
                What Do I Currently Have?
              </span>
              <h3 className="font-display font-bold text-xl text-white">
                National Inventory Stockpiles
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
            <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
              What Do I Need?
            </span>
            <h3 className="font-display font-bold text-xl text-white">
              Import Objectives
            </h3>
          </div>

          <ObjectivesList
            objectives={objectives}
            canImport={false}
          />
        </div>
      </div>

      {/* Sovereign Trade Ledger */}
      <div className="space-y-4 pt-4 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-bold tracking-widest text-slate-500 uppercase">
              What Have I Traded?
            </span>
            <h3 className="font-display font-bold text-xl text-white">
              Sovereign Trade Ledger
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
