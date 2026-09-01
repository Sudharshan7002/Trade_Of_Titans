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
      <div className="p-8 text-center bg-white dark:bg-titan-900 rounded-2xl border border-slate-200 dark:border-white/10 shadow-soft-card space-y-2">
        <Target className="w-10 h-10 text-slate-400 mx-auto" />
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Active Objectives Assigned</p>
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
            className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isFulfilled
                ? 'bg-emerald-50/80 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-500/30'
                : 'bg-white dark:bg-titan-900 border-slate-200/80 dark:border-white/10 shadow-soft-card hover:shadow-soft-card-hover'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg border ${
                      isFulfilled
                        ? 'bg-emerald-100 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                        : 'bg-sky-50 dark:bg-sky-500/15 border-sky-200 dark:border-sky-500/30 text-sky-700 dark:text-sky-400'
                    }`}
                  >
                    {isFulfilled ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                  </div>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                    {resourceName}
                  </h4>
                </div>

                <span
                  className={`text-xs font-mono font-bold ${
                    isFulfilled ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-cyan-300'
                  }`}
                >
                  {obj.imported_quantity.toLocaleString()} / {obj.required_quantity.toLocaleString()} u ({percentage}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-black/40 border border-slate-200/60 dark:border-white/5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFulfilled
                      ? 'bg-emerald-500 dark:bg-emerald-400'
                      : 'bg-slate-900 dark:bg-cyan-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {onImportResource && !isFulfilled && (
              <button
                onClick={() => onImportResource(obj.resource_id)}
                disabled={!canImport}
                className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-900 hover:text-white dark:hover:bg-cyan-500/20 dark:hover:text-cyan-200 border border-slate-200 dark:border-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
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
