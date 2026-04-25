import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { HTMLAttributes } from 'react';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-2xs font-medium font-mono uppercase tracking-coord whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-space-3 text-space-6',
        plasma: 'bg-plasma-bg text-plasma',
        cyan: 'bg-cyan-bg text-cyan',
        outline: 'border border-space-4 text-space-6',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
