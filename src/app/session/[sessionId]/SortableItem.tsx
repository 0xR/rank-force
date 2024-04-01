import { Item } from '@/core/Item';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableItem({ item }: { item: Item }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: item.id,
      data: { item },
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {item.label}
    </div>
  );
}
