import type { PokemonType } from '../types/pokemon';

const TYPE_COLORS: Record<PokemonType, string> = {
  normal: 'bg-gray-400 text-gray-900',
  fire: 'bg-orange-500 text-white',
  water: 'bg-blue-500 text-white',
  electric: 'bg-yellow-400 text-gray-900',
  grass: 'bg-green-500 text-white',
  ice: 'bg-cyan-300 text-gray-900',
  fighting: 'bg-red-700 text-white',
  poison: 'bg-purple-500 text-white',
  ground: 'bg-amber-600 text-white',
  flying: 'bg-indigo-300 text-gray-900',
  psychic: 'bg-pink-500 text-white',
  bug: 'bg-lime-500 text-gray-900',
  rock: 'bg-stone-500 text-white',
  ghost: 'bg-violet-700 text-white',
  dragon: 'bg-indigo-600 text-white',
  dark: 'bg-gray-800 text-white',
  steel: 'bg-slate-400 text-gray-900',
  fairy: 'bg-pink-300 text-gray-900',
};

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'faded';
  className?: string;
}

export function TypeBadge({
  type,
  size = 'md',
  variant = 'default',
  className = '',
}: TypeBadgeProps) {
  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-xs',
    md: 'px-2 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };

  const variantClasses = {
    default: TYPE_COLORS[type],
    faded: 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 line-through',
  };

  return (
    <span
      className={`
        inline-block rounded font-medium capitalize
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {type}
    </span>
  );
}
