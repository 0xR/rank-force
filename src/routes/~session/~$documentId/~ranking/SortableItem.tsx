import { cn } from '@/lib/utils';
import { Item } from '@/core/Item';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';

export function SortableItem({
  item,
  rank,
  onRemove,
}: {
  item: Item;
  rank: number;
  onRemove: () => void;
}) {
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
      className={cn(
        'group relative flex items-center gap-3 select-none',
        'rounded-md border bg-space-2 px-3 py-2.5',
        'border-space-4 hover:border-space-5',
        'transition-[box-shadow,border-color,opacity] duration-150 ease-out-quart',
        isDragging
          ? 'opacity-90 border-cyan shadow-[0_8px_24px_-12px_oklch(0.05_0.02_270/0.8)]'
          : '',
      )}
    >
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
      <span className="flex-1 truncate text-cream text-sm">{item.label}</span>
      <button
        type="button"
        aria-label={`Unrank ${item.label}`}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onRemove}
        className="shrink-0 inline-flex items-center justify-center h-8 w-8 -mr-1 rounded-md text-space-5 hover:text-cream hover:bg-space-3 transition-colors"
      >
        <X className="h-4 w-4" strokeWidth={1.75} />
      </button>
      <button
        type="button"
        aria-label={`Drag to reorder ${item.label}`}
        {...attributes}
        {...listeners}
        className="shrink-0 inline-flex items-center justify-center h-8 w-8 -mr-1 rounded-md text-space-5 hover:text-space-6 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
