import { StarMark } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import { Item } from '@/core/Item';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from 'lucide-react';

export function UnrankedItem({
  item,
  onPromote,
}: {
  item: Item;
  onPromote: () => void;
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
        'group relative flex items-stretch gap-1 select-none',
        'rounded-md border bg-space-2',
        'border-space-4 hover:border-space-5',
        'transition-[box-shadow,border-color,opacity] duration-150 ease-out-quart',
        isDragging
          ? 'opacity-90 border-cyan shadow-[0_8px_24px_-12px_oklch(0.05_0.02_270/0.8)]'
          : '',
      )}
    >
      <button
        type="button"
        onClick={onPromote}
        aria-label={`Rank ${item.label}`}
        className="min-w-0 flex-1 flex items-center gap-3 px-3 py-2.5 text-left rounded-md hover:bg-space-3 transition-colors"
      >
        <span className="w-7 shrink-0 flex justify-end">
          <StarMark className="h-3.5 w-3.5 text-space-5 group-hover:text-cyan transition-colors" />
        </span>
        <span className="flex-1 truncate text-cream text-sm">{item.label}</span>
        <span className="md:hidden shrink-0 inline-flex items-center justify-center h-5 w-5 rounded-md text-space-5 group-hover:text-cyan transition-colors">
          <Plus className="h-4 w-4" strokeWidth={1.75} />
        </span>
      </button>
      <button
        type="button"
        aria-label={`Drag ${item.label} to rank`}
        {...attributes}
        {...listeners}
        className="shrink-0 inline-flex items-center justify-center h-auto w-8 rounded-md text-space-5 hover:text-space-6 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </div>
  );
}
