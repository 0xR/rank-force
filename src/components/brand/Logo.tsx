import { cn } from '@/lib/utils';

export function StarMark({ className }: { className?: string }) {
  // A four-point star with a subtle inner light. Used as the brand glyph.
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={cn('h-6 w-6', className)}
    >
      <path
        d="M12 1.5 L13.6 10.4 L22.5 12 L13.6 13.6 L12 22.5 L10.4 13.6 L1.5 12 L10.4 10.4 Z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="1.4" fill="oklch(0.96 0.015 90)" />
    </svg>
  );
}

export function Wordmark({
  size = 'md',
  className,
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const text = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }[size];
  const star = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
  }[size];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 font-semibold tracking-tight text-cream',
        className,
      )}
    >
      <StarMark className={cn(star, 'text-plasma')} />
      <span className={text}>
        Rank<span className="text-space-6"> </span>Force
      </span>
    </span>
  );
}
