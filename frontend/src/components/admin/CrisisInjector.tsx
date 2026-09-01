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
    <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-white/10 shadow-sm space-y-6">
      <div className="border-b border-neutral-100 dark:border-white/10 pb-4">
        <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-500 uppercase">
          // Market Volatility Injection
        </span>
        <h3 className="font-display font-black text-2xl text-black dark:text-white mt-0.5">
          Crises & Value <span className="text-[#FF5533] dark:text-[#CCFF00]">Modifiers</span>
        </h3>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="p-5 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/90 dark:border-white/10 space-y-4 shadow-sm"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div>
            <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 mb-1.5">
              Target Round
            </label>
            <select
              value={roundId}
              onChange={(e) => setRoundId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white font-semibold focus:outline-none focus:border-black dark:focus:border-[#CCFF00]"
              required
            >
              <option value="" disabled className="bg-white dark:bg-[#0A0A0A] text-neutral-400">
                -- Select Round --
              </option>
              {allRounds.map((r) => (
                <option key={r.id} value={r.id} className="bg-white dark:bg-[#0A0A0A] text-black dark:text-white">
                  Round #{r.round_number} {r.is_active ? '(Active)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 mb-1.5">
              Affected Resource
            </label>
            <select
              value={resourceId}
              onChange={(e) => setResourceId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white font-semibold focus:outline-none focus:border-black dark:focus:border-[#CCFF00]"
              required
            >
              <option value="" disabled className="bg-white dark:bg-[#0A0A0A] text-neutral-400">
                -- Select Resource --
              </option>
              {resources.map((res) => (
                <option key={res.id} value={res.id} className="bg-white dark:bg-[#0A0A0A] text-black dark:text-white">
                  {res.name} (Base: ${res.base_value})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase text-neutral-600 dark:text-neutral-400 mb-1.5">
              Value Multiplier ({valueModifier}x)
            </label>
            <input
              type="number"
              step="0.05"
              min="0.1"
              max="5.0"
              value={valueModifier}
              onChange={(e) => setValueModifier(parseFloat(e.target.value))}
              className="w-full rounded-xl px-3.5 py-2.5 text-xs bg-white dark:bg-[#0A0A0A] border border-neutral-200 dark:border-white/10 text-black dark:text-white font-mono font-bold focus:outline-none focus:border-black dark:focus:border-[#CCFF00]"
              required
            />
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-2.5 border-t border-neutral-200/80 dark:border-white/5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-mono text-neutral-500">Presets:</span>
            <button
              type="button"
              onClick={() => setValueModifier(1.3)}
              className="px-2.5 py-1 rounded-lg bg-[#CCFF00]/15 text-black dark:text-[#CCFF00] border border-[#CCFF00]/40 text-[10px] font-display font-bold"
            >
              +30% Boom (1.30x)
            </button>
            <button
              type="button"
              onClick={() => setValueModifier(1.15)}
              className="px-2.5 py-1 rounded-lg bg-[#CCFF00]/15 text-black dark:text-[#CCFF00] border border-[#CCFF00]/40 text-[10px] font-display font-bold"
            >
              +15% Growth (1.15x)
            </button>
            <button
              type="button"
              onClick={() => setValueModifier(0.85)}
              className="px-2.5 py-1 rounded-lg bg-[#FF5533]/15 text-[#FF5533] border border-[#FF5533]/40 text-[10px] font-display font-bold"
            >
              -15% Dip (0.85x)
            </button>
            <button
              type="button"
              onClick={() => setValueModifier(0.7)}
              className="px-2.5 py-1 rounded-lg bg-[#FF5533]/15 text-[#FF5533] border border-[#FF5533]/40 text-[10px] font-display font-bold"
            >
              -30% Collapse (0.70x)
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-black hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-200 text-white dark:text-black font-display font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            {isSubmitting ? (
              <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Flame className="w-3.5 h-3.5 text-[#FF5533]" />
            )}
            <span>Inject Crisis Modifier</span>
          </button>
        </div>
      </form>

      {/* Active Crises List */}
      <div className="space-y-3">
        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500">
          // Recorded Market Modifiers
        </div>
        {crises.length === 0 ? (
          <p className="text-xs text-neutral-500 italic font-mono">No active crises registered in this tournament.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {crises.map((c, idx) => {
              const resName = getResourceName(c.resource_id);
              const isBoom = c.value_modifier >= 1.0;

              return (
                <div
                  key={c.id ?? idx}
                  className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-white/10 flex items-center justify-between text-xs shadow-sm"
                >
                  <div>
                    <span className="font-display font-bold text-black dark:text-white text-sm">{resName}</span>
                    <div className="text-[10px] font-mono text-neutral-500">
                      Round #{c.round_id || 'N/A'}
                    </div>
                  </div>
                  <span
                    className={`font-mono font-bold px-2.5 py-1 rounded-xl border text-[11px] flex items-center gap-1 ${
                      isBoom
                        ? 'bg-[#CCFF00] text-black border-[#A3CC00]'
                        : 'bg-[#FF5533] text-white border-[#E03D1B]'
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
