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
      <div className="p-8 text-center bg-white dark:bg-[#111111] rounded-2xl border border-neutral-200 dark:border-white/10 shadow-sm space-y-2">
        <Target className="w-10 h-10 text-neutral-400 mx-auto" />
        <p className="text-sm font-display font-bold text-black dark:text-white">No Active Objectives Assigned</p>
        <p className="text-xs text-neutral-500 max-w-sm mx-auto">
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
                ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40 text-black dark:text-[#CCFF00]'
                : 'bg-white dark:bg-[#111111] border-neutral-200/90 dark:border-white/10 shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-xl border ${
                      isFulfilled
                        ? 'bg-[#CCFF00] text-black border-[#CCFF00]'
                        : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-white/10 text-black dark:text-[#CCFF00]'
                    }`}
                  >
                    {isFulfilled ? <CheckCircle2 className="w-4 h-4" /> : <Target className="w-4 h-4" />}
                  </div>
                  <h4 className="font-display font-bold text-sm text-black dark:text-white truncate">
                    {resourceName}
                  </h4>
                </div>

                <span
                  className={`text-xs font-mono font-bold ${
                    isFulfilled ? 'text-black dark:text-[#CCFF00]' : 'text-neutral-700 dark:text-white'
                  }`}
                >
                  {obj.imported_quantity.toLocaleString()} / {obj.required_quantity.toLocaleString()} u ({percentage}%)
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-neutral-200 dark:bg-neutral-800 border border-neutral-300/40 dark:border-white/5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isFulfilled
                      ? 'bg-black dark:bg-[#CCFF00]'
                      : 'bg-neutral-800 dark:bg-white'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            {onImportResource && !isFulfilled && (
              <button
                onClick={() => onImportResource(obj.resource_id)}
                disabled={!canImport}
                className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-display font-bold bg-neutral-100 dark:bg-white/5 text-neutral-800 dark:text-neutral-200 hover:bg-black hover:text-white dark:hover:bg-[#CCFF00] dark:hover:text-black border border-neutral-200 dark:border-white/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
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
