import React, { useState } from 'react';
import { useGameState } from '../../context/GameStateContext';
import { useToast } from '../../context/ToastContext';
import { crisesApi } from '../../api/crises';
import { Flame, TrendingUp, TrendingDown } from 'lucide-react';
import { Crisis } from '../../types/api';

interface CrisisInjectorProps {
  crises: Crisis[];
  onCrisisInjected: () => void;
}

export const CrisisInjector: React.FC<CrisisInjectorProps> = ({
  crises,
  onCrisisInjected,
}) => {
  const { allRounds, resources, getResourceName } = useGameState();
  const { success, error: toastError } = useToast();

  const [roundId, setRoundId] = useState<number | ''>('');
  const [resourceId, setResourceId] = useState<number | ''>('');
  const [valueModifier, setValueModifier] = useState<number>(1.25);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roundId || !resourceId || !valueModifier) {
      toastError('Missing Fields', 'Please select round, resource, and modifier.');
      return;
    }

    setIsSubmitting(true);
    try {
      await crisesApi.createCrisis({
        round_id: Number(roundId),
        resource_id: Number(resourceId),
        value_modifier: Number(valueModifier),
      });
      success(
        'Crisis Market Modifier Injected',
        `Resource value modifier (${valueModifier}x) active for Round #${roundId}.`
      );
      onCrisisInjected();
    } catch (err: any) {
      toastError('Crisis Injection Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-3xl bg-white dark:bg-titan-900 border border-slate-200/80 dark:border-white/10 shadow-soft-card space-y-6">
      <div>
        <span className="text-xs font-mono font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
          Market Volatility Injection
        </span>
        <h3 className="font-display font-bold text-xl text-slate-950 dark:text-white mt-0.5">
          Crises & Resource Value Modifiers
        </h3>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl bg-slate-50 dark:bg-titan-950/60 border border-slate-200/80 dark:border-white/5 space-y-4 shadow-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Target Round
            </label>
            <select
              value={roundId}
              onChange={(e) => setRoundId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-titan-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-sky-400"
              required
            >
              <option value="" disabled className="bg-white dark:bg-titan-900 text-slate-400">
                -- Select Round --
              </option>
              {allRounds.map((r) => (
                <option key={r.id} value={r.id} className="bg-white dark:bg-titan-900 text-slate-900 dark:text-white">
                  Round #{r.round_number} {r.is_active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Affected Resource
            </label>
            <select
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-titan-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-slate-900 dark:focus:border-sky-400"
              required
            >
              <option value="" disabled className="bg-white dark:bg-titan-900 text-slate-400">
                -- Select Resource --
              </option>
              {resources.map((res) => (
                <option key={res.id} value={res.id} className="bg-white dark:bg-titan-900 text-slate-900 dark:text-white">
                  {res.name} (Base: ${res.base_value})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Value Multiplier ({valueModifier}x)
            </label>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="5.0"
              value={valueModifier}
              onChange={(e) => setValueModifier(parseFloat(e.target.value))}
              className="w-full rounded-xl px-3 py-2 text-xs bg-white dark:bg-titan-900 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono focus:outline-none focus:border-slate-900 dark:focus:border-sky-400"
              required
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2.5 border-t border-slate-200/80 dark:border-white/5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Presets:</span>
            <button
              type="button"
              onClick={() => setValueModifier(1.3)}
              className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold"
            >
              +30% Boom (1.30x)
            </button>
            <button
              type="button"
              onClick={() => setValueModifier(1.15)}
              className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold"
            >
              +15% Growth (1.15x)
            </button>
            <button
              type="button"
              onClick={() => setValueModifier(0.85)}
              className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[10px] font-bold"
            >
              -15% Dip (0.85x)
            </button>
            <button
              type="button"
              onClick={() => setValueModifier(0.7)}
              className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 text-[10px] font-bold"
            >
              -30% Collapse (0.70x)
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            {isSubmitting ? (
              <div className="w-3 h-3 border-2 border-white dark:border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Flame className="w-3.5 h-3.5" />
            )}
            <span>Inject Crisis Modifier</span>
          </button>
        </div>
      </form>

      {/* Active Crises List */}
      <div className="space-y-2.5">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Recorded Market Modifiers
        </div>
        {crises.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No crises registered in the database.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {crises.map((c, idx) => {
              const resName = getResourceName(c.resource_id);
              const isBoom = c.value_modifier >= 1.0;

              return (
                <div
                  key={c.id ?? idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-titan-950/40 border border-slate-200/80 dark:border-white/5 flex items-center justify-between text-xs shadow-sm"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">{resName}</span>
                    <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      Round #{c.round_id || 'N/A'}
                    </div>
                  </div>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded border text-[11px] flex items-center gap-1 ${
                      isBoom
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/30'
                    }`}
                  >
                    {isBoom ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {c.value_modifier}x
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
