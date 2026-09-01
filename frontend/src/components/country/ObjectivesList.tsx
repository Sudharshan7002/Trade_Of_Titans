import React from 'react';
import { useGameState } from '../../context/GameStateContext';
import { Target, CheckCircle2, ArrowDownLeft } from 'lucide-react';

interface ObjectivesListProps {
  objectives: Array<{
    resource_id: number;
    required_quantity: number;
    imported_quantity: number;
  }>;
  onImportResource?: (resourceId: number) => void;
  canImport?: boolean;
}

export const ObjectivesList: React.FC<ObjectivesListProps> = ({
  objectives,
  onImportResource,
  canImport = true,
}) => {
  const { getResourceName } = useGameState();

  if (!objectives || objectives.length === 0) {
    return (
      <div className="p-8 text-center glass-card rounded-2xl border border-white/5 space-y-2">
        <Target className="w-10 h-10 text-slate-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-300">No Active Objectives Assigned</p>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Supreme Command has not assigned import quotas for this sovereign state yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {objectives.map((obj) => {
        const resourceName = getResourceName(obj.resource_id);
        const percentage = Math.min(
          100,
          Math.round((obj.imported_quantity / (obj.required_quantity || 1)) * 100)
        );
        const isFulfilled = obj.imported_quantity >= obj.required_quantity;

        return (
          <div
            key={obj.resource_id}
            className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isFulfilled
                ? 'bg-emerald-950/20 border-emerald-500/30'
                : 'glass-panel border-white/5 hover:border-cyan-500/30'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg border ${
                      isFulfilled
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                        : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                    }`}
                  >
                    {isFulfilled ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                  </div>
                  <h4 className="font-display font-bold text-sm text-white truncate">
                    {resourceName}
                  </h4>
                </div>

                <span
                  className={`text-xs font-mono font-bold ${
                    isFulfilled ? 'text-emerald-400' : 'text-cyan-300'
                  }`}
                >
                  {obj.imported_quantity} / {obj.required_quantity} units ({percentage}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-black/40 border border-white/5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFulfilled
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {onImportResource && !isFulfilled && (
              <button
                onClick={() => onImportResource(obj.resource_id)}
                disabled={!canImport}
                className="shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Search Importers</span>
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
