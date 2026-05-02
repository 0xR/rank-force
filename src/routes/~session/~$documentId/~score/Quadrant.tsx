'use client';
import { RankDimension } from '@/core/RankDimension';
import { cn } from '@/lib/utils';

export type QuadrantPoint = {
  itemId: string;
  label: string;
  rank: number;
  x: number;
  y: number;
};

type QuadrantProps = {
  yDimension: RankDimension;
  xDimension: RankDimension;
  points: QuadrantPoint[];
  variant?: 'aggregate' | 'small';
};

function highEnd(d: RankDimension) {
  return d.direction === 'ascending' ? d.labelEnd : d.labelStart;
}

function lowEnd(d: RankDimension) {
  return d.direction === 'ascending' ? d.labelStart : d.labelEnd;
}

export function Quadrant({
  yDimension,
  xDimension,
  points,
  variant = 'aggregate',
}: QuadrantProps) {
  const isSmall = variant === 'small';
  const labelTop = highEnd(yDimension);
  const labelBottom = lowEnd(yDimension);
  const labelLeft = highEnd(xDimension);
  const labelRight = lowEnd(xDimension);

  const plot = (
    <div
      className={cn(
        'relative w-full rounded-md border border-space-4 bg-space-1',
        isSmall ? 'aspect-[5/4]' : 'aspect-[3/2] sm:aspect-[2/1]',
      )}
    >
      <div
        aria-hidden
        className="absolute inset-y-0 left-1/2 w-px bg-space-4"
      />
      <div aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-space-4" />

      {points.map((p) => {
        const leftPct = (1 - p.x) * 100;
        const topPct = (1 - p.y) * 100;
        const labelOnRight = leftPct < 50;
        const isWinner = p.rank === 1;
        return (
          <div
            key={p.itemId}
            className="absolute"
            style={{ left: `${leftPct}%`, top: `${topPct}%` }}
          >
            <div
              title={p.label}
              className={cn(
                'absolute grid place-items-center rounded-full font-mono tabular-nums select-none',
                isSmall
                  ? 'h-[18px] w-[18px] text-[10px] leading-none'
                  : 'h-6 w-6 text-xs leading-none',
                isWinner
                  ? 'bg-plasma text-plasma-fg ring-[3px] ring-plasma-bg/70'
                  : 'bg-space-2 text-cream border border-space-4',
              )}
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              {p.rank.toString().padStart(2, '0')}
            </div>
            {!isSmall && (
              <span
                className={cn(
                  'absolute max-w-[9rem] truncate text-xs',
                  isWinner
                    ? 'text-cream font-medium'
                    : 'text-space-6 font-normal',
                )}
                style={{
                  top: 0,
                  transform: 'translateY(-50%)',
                  ...(labelOnRight
                    ? { left: '18px' }
                    : { right: '18px', textAlign: 'right' }),
                }}
              >
                {p.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  if (isSmall) return plot;

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_minmax(0,1fr)_auto] gap-x-3 gap-y-2 items-center justify-items-center">
      <div />
      <div className="flex flex-col items-center gap-0.5 max-w-full">
        <span
          title={yDimension.name}
          className="text-2xs font-mono font-medium uppercase tracking-coord text-cream truncate max-w-full"
        >
          {yDimension.name}
        </span>
        <span
          title={labelTop}
          className="text-[10px] font-mono uppercase tracking-coord text-space-5 truncate max-w-full"
        >
          {labelTop}
        </span>
      </div>
      <div />

      <div className="flex flex-col items-end gap-0.5 max-w-[7rem]">
        <span
          title={xDimension.name}
          className="text-2xs font-mono font-medium uppercase tracking-coord text-cream truncate max-w-full"
        >
          {xDimension.name}
        </span>
        <span
          title={labelLeft}
          className="text-[10px] font-mono uppercase tracking-coord text-space-5 truncate max-w-full"
        >
          {labelLeft}
        </span>
      </div>
      <div className="w-full">{plot}</div>
      <span
        title={labelRight}
        className="text-[10px] font-mono uppercase tracking-coord text-space-5 truncate max-w-[7rem] text-left"
      >
        {labelRight}
      </span>

      <div />
      <span
        title={labelBottom}
        className="text-[10px] font-mono uppercase tracking-coord text-space-5 truncate max-w-full"
      >
        {labelBottom}
      </span>
      <div />
    </div>
  );
}
