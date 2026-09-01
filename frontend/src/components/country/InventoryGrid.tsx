import React from 'react';
import { useGameState } from '../../context/GameStateContext';
import { Package, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';

interface InventoryGridProps {
  inventory: Array<{ resource_id: number; quantity: number }>;
  crises: Array<{ resource_id: number; value_modifier: number }>;
  onExportResource?: (resourceId: number) => void;
  canExport?: boolean;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  inventory,
  crises,
  onExportResource,
  canExport = true,
}) => {
  const { getResourceName, getResourceBaseValue } = useGameState();

  const crisisMap = React.useMemo(() => {
    const map: Record<number, number> = {};
    crises.forEach((c) => {
      map[c.resource_id] = Number(c.value_modifier);
    });
    return map;
  }, [crises]);

  if (!inventory || inventory.length === 0) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl border border-white/5 space-y-2">
        <Package className="w-10 h-10 text-slate-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-300">National Stockpiles Empty</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Your country currently holds zero strategic resource units. Import goods from other countries to build stockpiles.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {inventory.map((item) => {
        const name = getResourceName(item.resource_id);
        const baseValue = getResourceBaseValue(item.resource_id);
        const modifier = crisisMap[item.resource_id] ?? 1.0;
        const unitValue = baseValue * modifier;
        const totalValue = unitValue * item.quantity;
        const hasCrisis = modifier !== 1.0;
        const isSurplusCrisis = modifier > 1.0;

        return (
          <div
            key={item.resource_id}
            className="glass-panel rounded-2xl p-5 border border-white/5 hover:border-cyan-500/30 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-white">{name}</h4>
                    <span className="text-[11px] font-mono text-slate-400">ID #{item.resource_id}</span>
                  </div>
                </div>

                {hasCrisis && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                      isSurplusCrisis
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                        : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                    }`}
                  >
                    {isSurplusCrisis ? (
                      <TrendingUp className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-rose-400" />
                    )}
                    {modifier}x Mkt
                  </span>
                )}
              </div>

              {/* Quantity Stockpile */}
              <div className="my-4">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Available Stock
                </div>
                <div className="font-display font-black text-3xl text-white tracking-tight mt-0.5">
                  {item.quantity.toLocaleString()}{' '}
                  <span className="text-sm font-normal text-slate-400">units</span>
                </div>
              </div>

              {/* Valuation Breakdown */}
              <div className="p-3 rounded-xl bg-black/30 border border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Base Unit Value:</span>
                  <span className="font-mono text-slate-200">${baseValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Effective Value:</span>
                  <span
                    className={`font-mono font-semibold ${
                      hasCrisis
                        ? isSurplusCrisis
                          ? 'text-emerald-400'
                          : 'text-rose-400'
                        : 'text-cyan-300'
                    }`}
                  >
                    ${unitValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400 pt-1 border-t border-white/5 font-semibold">
                  <span className="text-slate-300">Total Stock Value:</span>
                  <span className="font-mono text-white">${totalValue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {onExportResource && (
              <div className="mt-4 pt-3 border-t border-white/5">
                <button
                  onClick={() => onExportResource(item.resource_id)}
                  disabled={!canExport || item.quantity <= 0}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold text-slate-300 bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-200 border border-white/10 hover:border-cyan-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Initiate Export Offer</span>
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
