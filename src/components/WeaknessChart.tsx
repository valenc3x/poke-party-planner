import { useState } from 'react';
import type { WeaknessAnalysis, PokemonType } from '../types/pokemon';
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
  const [expandedType, setExpandedType] = useState<PokemonType | null>(null);

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

  const getSeverity = (count: number): 'critical' | 'warning' | 'normal' => {
    if (count >= 4) return 'critical';
    if (count === 3) return 'warning';
    return 'normal';
  };

  const expandedWeakness = expandedType
    ? weaknessAnalysis.find((w) => w.type === expandedType)
    : null;

  return (
    <div className="space-y-3">
      {/* Summary Bar */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        {criticalWeaknesses.length > 0 && (
          <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
            <span aria-hidden="true">⚠️</span>
            {criticalWeaknesses.length} critical
          </span>
        )}
        {stackedWeaknesses.length > 0 && (
          <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
            <span aria-hidden="true">⚡</span>
            {stackedWeaknesses.length} stacked
          </span>
        )}
        <span className="text-gray-500 dark:text-gray-400">
          {weaknessAnalysis.length} weakness types
        </span>
      </div>

      {/* Weakness Grid */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2"
        role="list"
        aria-label="Team weaknesses"
      >
        {weaknessAnalysis.map((weakness) => (
          <CompactWeaknessBadge
            key={weakness.type}
            weakness={weakness}
            severity={getSeverity(weakness.count)}
            isExpanded={expandedType === weakness.type}
            onToggle={() =>
              setExpandedType(expandedType === weakness.type ? null : weakness.type)
            }
          />
        ))}
      </div>

      {/* Expanded Detail Panel */}
      {expandedWeakness && (
        <WeaknessDetailPanel
          weakness={expandedWeakness}
          severity={getSeverity(expandedWeakness.count)}
          onClose={() => setExpandedType(null)}
        />
      )}
    </div>
  );
}

interface CompactWeaknessBadgeProps {
  weakness: WeaknessAnalysis;
  severity: 'critical' | 'warning' | 'normal';
  isExpanded: boolean;
  onToggle: () => void;
}

function CompactWeaknessBadge({
  weakness,
  severity,
  isExpanded,
  onToggle,
}: CompactWeaknessBadgeProps) {
  const severityRing = {
    critical: 'ring-2 ring-red-500 ring-offset-1 dark:ring-offset-gray-900',
    warning: 'ring-2 ring-orange-500 ring-offset-1 dark:ring-offset-gray-900',
    normal: '',
  };

  const countClasses = {
    critical: 'bg-red-500 text-white',
    warning: 'bg-orange-500 text-white',
    normal: 'bg-gray-400 dark:bg-gray-600 text-white',
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-label={`${weakness.type}: ${weakness.count} Pokemon weak`}
      role="listitem"
      className={`
        relative inline-flex items-center justify-between gap-1.5 p-1.5 rounded-lg
        bg-gray-100 dark:bg-gray-700
        hover:bg-gray-200 dark:hover:bg-gray-600
        focus:outline-none focus:ring-2 focus:ring-blue-500
        transition-colors
        ${severityRing[severity]}
        ${isExpanded ? 'bg-gray-200 dark:bg-gray-600' : ''}
      `}
    >
      <TypeBadge type={weakness.type} size="xs" />
      <span
        className={`
          w-5 h-5 rounded-full flex items-center justify-center
          text-xs font-bold ${countClasses[severity]}
        `}
      >
        {weakness.count}
      </span>
    </button>
  );
}

interface WeaknessDetailPanelProps {
  weakness: WeaknessAnalysis;
  severity: 'critical' | 'warning' | 'normal';
  onClose: () => void;
}

function WeaknessDetailPanel({ weakness, severity, onClose }: WeaknessDetailPanelProps) {
  const severityBg = {
    critical: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    warning: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    normal: 'bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600',
  };

  return (
    <div
      className={`p-3 rounded-lg border ${severityBg[severity]}`}
      role="region"
      aria-label={`Pokemon weak to ${weakness.type}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <TypeBadge type={weakness.type} size="sm" />
          <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">
            Weak Pokemon ({weakness.count}):
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
          aria-label="Close details"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
      <div className="flex flex-wrap gap-1">
        {weakness.pokemonNames.map((name) => (
          <span
            key={name}
            className="px-2 py-0.5 bg-white dark:bg-gray-800 rounded text-sm text-gray-600 dark:text-gray-400"
          >
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}
