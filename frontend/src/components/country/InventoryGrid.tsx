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
      <div className="p-8 text-center bg-white dark:bg-[#111111] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-sm space-y-2">
        <Package className="w-10 h-10 text-neutral-400 mx-auto" />
        <p className="text-sm font-display font-bold text-black dark:text-white">National Stockpiles Empty</p>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
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
            className="rounded-2xl p-5 bg-white dark:bg-[#111111] border border-neutral-200/90 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-xl bg-black dark:bg-[#CCFF00] text-[#CCFF00] dark:text-black">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-base text-black dark:text-white">{name}</h4>
                    <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400">ID #{item.resource_id}</span>
                  </div>
                </div>

                {hasCrisis && (
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-display font-bold uppercase tracking-wider border ${
                      isSurplusCrisis
                        ? 'bg-[#CCFF00] text-black border-[#A3CC00]'
                        : 'bg-[#FF5533] text-white border-[#E03D1B]'
                    }`}
                  >
                    {isSurplusCrisis ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {modifier}x
                  </span>
                )}
              </div>

              {/* Quantity Stockpile */}
              <div className="my-3.5">
                <div className="text-[11px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  Available Stock
                </div>
                <div className="font-display font-black text-3xl text-black dark:text-white tracking-tight mt-0.5">
                  {item.quantity.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">units</span>
                </div>
              </div>

              {/* Valuation Breakdown */}
              <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200/60 dark:border-white/5 space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400 font-mono">
                  <span>Base Unit:</span>
                  <span className="text-neutral-800 dark:text-neutral-200">${baseValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400 font-mono">
                  <span>Effective:</span>
                  <span
                    className={`font-bold ${
                      hasCrisis
                        ? isSurplusCrisis
                          ? 'text-[#16a34a] dark:text-[#CCFF00]'
                          : 'text-[#FF5533]'
                        : 'text-black dark:text-white'
                    }`}
                  >
                    ${unitValue.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500 dark:text-neutral-400 pt-1.5 border-t border-neutral-200 dark:border-white/5 font-semibold">
                  <span className="text-neutral-800 dark:text-neutral-300">Total Value:</span>
                  <span className="font-mono text-black dark:text-white font-bold">${totalValue.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {onExportResource && (
              <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-white/5">
                <button
                  onClick={() => onExportResource(item.resource_id)}
                  disabled={!canExport || item.quantity <= 0}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-display font-bold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-white/5 hover:bg-black hover:text-white dark:hover:bg-[#CCFF00] dark:hover:text-black border border-neutral-200 dark:border-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
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
