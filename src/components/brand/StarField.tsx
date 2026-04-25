import { cn } from '@/lib/utils';
import { useMemo } from 'react';

// Deterministic LCG so the starfield is identical across renders and SSR/CSR.
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

type Star = { x: number; y: number; r: number; o: number };

function generate(seed: number, count: number): Star[] {
  const rand = seeded(seed);
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    const r = rand();
    stars.push({
      x: rand() * 100,
      y: rand() * 100,
      r: r < 0.85 ? 0.6 + rand() * 0.8 : 1.2 + rand() * 1.3,
      o: 0.18 + rand() * 0.5,
    });
  }
  return stars;
}

/**
 * Static, sparse star field for the welcome surface only.
 * No animation, no parallax, no twinkle.
 */
export function StarField({
  className,
  density = 90,
  seed = 7,
}: {
  className?: string;
  density?: number;
  seed?: number;
}) {
  const stars = useMemo(() => generate(seed, density), [seed, density]);
  return (
    <svg
      aria-hidden="true"
      className={cn(
        'absolute inset-0 h-full w-full pointer-events-none',
        className,
      )}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {stars.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r * 0.18}
          fill="oklch(0.96 0.015 90)"
          opacity={s.o}
        />
      ))}
    </svg>
  );
}
