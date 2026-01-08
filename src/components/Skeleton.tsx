interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
      aria-hidden="true"
    />
  );
}

export function PokemonCardSkeleton() {
  return (
    <div className="flex flex-col items-center p-1.5 sm:p-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded" />
      <Skeleton className="w-16 h-3 mt-2" />
      <div className="flex gap-1 mt-1">
        <Skeleton className="w-10 h-4 rounded" />
      </div>
    </div>
  );
}

export function TeamSlotSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`flex flex-col items-center rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${
        compact ? 'p-1 sm:p-1.5 min-h-[70px] sm:min-h-[80px]' : 'p-3 sm:p-4 min-h-[160px] sm:min-h-[200px]'
      }`}
    >
      <Skeleton
        className={compact ? 'w-8 h-8 sm:w-10 sm:h-10 rounded' : 'w-16 h-16 sm:w-24 sm:h-24 rounded'}
      />
      <Skeleton className={`mt-2 ${compact ? 'w-10 h-2' : 'w-16 h-4'}`} />
      <div className={`flex gap-1 ${compact ? 'mt-1' : 'mt-2'}`}>
        <Skeleton className={compact ? 'w-6 h-3' : 'w-10 h-4'} />
      </div>
    </div>
  );
}

export function PokedexGridSkeleton({ count = 24 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Skeleton className="flex-1 h-10 rounded-lg" />
        <Skeleton className="w-full sm:w-32 h-10 rounded-lg" />
      </div>
      <Skeleton className="w-40 h-4" />
      <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-1.5 sm:gap-2">
        {Array.from({ length: count }).map((_, i) => (
          <PokemonCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
