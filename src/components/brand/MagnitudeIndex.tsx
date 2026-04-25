import { cn } from '@/lib/utils';

/**
 * Mono numeral indicating rank position. Rank 1 is brightest (plasma);
 * rank 2–3 cream; rank 4+ dim.
 */
export function MagnitudeIndex({
  rank,
  size = 'md',
  className,
}: {
  rank: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const tier =
    rank === 1 ? 'text-plasma' : rank <= 3 ? 'text-cream' : 'text-space-6';
  const sizeClass = {
    sm: 'text-xs w-6',
    md: 'text-sm w-7',
    lg: 'text-base w-9',
  }[size];
  return (
    <span
      className={cn(
        'font-mono tabular-nums tracking-coord text-right font-medium',
        sizeClass,
        tier,
        className,
      )}
    >
      {String(rank).padStart(2, '0')}
    </span>
  );
}
