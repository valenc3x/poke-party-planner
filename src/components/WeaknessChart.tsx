import type { WeaknessAnalysis } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';

interface WeaknessChartProps {
  weaknessAnalysis: WeaknessAnalysis[];
  criticalWeaknesses: WeaknessAnalysis[];
  stackedWeaknesses: WeaknessAnalysis[];
}

export function WeaknessChart({
  weaknessAnalysis,
  criticalWeaknesses,
  stackedWeaknesses,
}: WeaknessChartProps) {
  if (weaknessAnalysis.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8">
        <div className="text-3xl sm:text-4xl mb-2" aria-hidden="true">📊</div>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
          Add Pokemon to your team to see weakness analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {criticalWeaknesses.length > 0 && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <h3 className="font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            Critical Weaknesses
          </h3>
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">
            4 or more team members share these weaknesses:
          </p>
          <div className="space-y-2">
            {criticalWeaknesses.map((weakness) => (
              <WeaknessRow key={weakness.type} weakness={weakness} severity="critical" />
            ))}
          </div>
        </div>
      )}

      {stackedWeaknesses.length > 0 && (
        <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
          <h3 className="font-medium text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-2">
            <span className="text-lg">⚡</span>
            Stacked Weaknesses
          </h3>
          <p className="text-sm text-orange-600 dark:text-orange-400 mb-3">
            3 team members share these weaknesses:
          </p>
          <div className="space-y-2">
            {stackedWeaknesses.map((weakness) => (
              <WeaknessRow key={weakness.type} weakness={weakness} severity="warning" />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">
          All Team Weaknesses
        </h3>
        <div className="space-y-2">
          {weaknessAnalysis.map((weakness) => (
            <WeaknessRow
              key={weakness.type}
              weakness={weakness}
              severity={
                weakness.count >= 4
                  ? 'critical'
                  : weakness.count === 3
                    ? 'warning'
                    : 'normal'
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface WeaknessRowProps {
  weakness: WeaknessAnalysis;
  severity: 'critical' | 'warning' | 'normal';
}

function WeaknessRow({ weakness, severity }: WeaknessRowProps) {
  const severityClasses = {
    critical: 'bg-red-100 dark:bg-red-900/30',
    warning: 'bg-orange-100 dark:bg-orange-900/30',
    normal: 'bg-gray-50 dark:bg-gray-800',
  };

  const countClasses = {
    critical: 'bg-red-500 text-white',
    warning: 'bg-orange-500 text-white',
    normal: 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300',
  };

  return (
    <div
      className={`flex items-center gap-3 p-2 rounded-lg ${severityClasses[severity]}`}
    >
      <TypeBadge type={weakness.type} size="sm" />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-gray-600 dark:text-gray-400 truncate block">
          {weakness.pokemonNames.join(', ')}
        </span>
      </div>
      <span
        className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${countClasses[severity]}`}
      >
        {weakness.count}
      </span>
    </div>
  );
}
