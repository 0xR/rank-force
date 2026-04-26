import { StarMark } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import { Item } from '@/core/Item';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

export function SortableItem({ item, rank }: { item: Item; rank?: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { item },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'group relative flex items-center gap-3 select-none touch-none',
        'rounded-md border bg-space-2 px-3 py-2.5 cursor-grab active:cursor-grabbing',
        'border-space-4 hover:border-space-5',
        'transition-[box-shadow,border-color,opacity] duration-150 ease-out-quart',
        isDragging
          ? 'opacity-90 border-cyan shadow-[0_8px_24px_-12px_oklch(0.05_0.02_270/0.8)]'
          : '',
      )}
    >
      {typeof rank === 'number' ? (
        <span
          className={cn(
            'font-mono tabular-nums text-sm tracking-coord w-7 text-right shrink-0',
            rank === 1
              ? 'text-plasma'
              : rank <= 3
                ? 'text-cream'
                : 'text-space-6',
          )}
        >
          {String(rank).padStart(2, '0')}
        </span>
      ) : (
        <span className="w-7 shrink-0 flex justify-end">
          <StarMark className="h-3.5 w-3.5 text-space-5" />
        </span>
      )}
      <span className="flex-1 truncate text-cream text-sm">{item.label}</span>
      <GripVertical
        className="h-4 w-4 text-space-5 group-hover:text-space-6 shrink-0"
        strokeWidth={1.5}
      />
    </div>
  );
}
