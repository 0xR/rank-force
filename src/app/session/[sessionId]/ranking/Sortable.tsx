import { useChanged } from '@/app/session/[sessionId]/ranking/UseChanged';
import { Typography } from '@/components/ui/typography';
import { Item, itemsIncludes } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { cx } from 'class-variance-authority';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { SortableItem } from './SortableItem';

function assertString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Expected a string');
  }
}

function Droppable({
  id,
  children,
  className,
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const { setNodeRef } = useDroppable({
    id,
  });
  return (
    <div
      className={cx(
        'bg-gray-300 min-h-[100px] p-4 flex flex-col gap-2',
        className,
      )}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}

export function Sortable({
  items,
  onChange,
  initialRanking,
  rankDimension,
}: {
  items: Item[];
  onChange: (items: Item[]) => void;
  initialRanking: Item[];
  rankDimension: RankDimension;
}) {
  const [items1, setItems1] = useState(() => {
    return items.filter((item) => !itemsIncludes(initialRanking, item));
  });
  const [items2, setItems2] = useState<Item[]>(initialRanking);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor),
  );

  const itemsPropChanged = useChanged(items);

  useEffect(() => {
    if (!itemsPropChanged) return;
    const newItems = items.filter(
      (item) => !itemsIncludes(items1, item) && !itemsIncludes(items2, item),
    );
    if (newItems.length) {
      setItems1((items) => [...items, ...newItems]);
    }
    // remove items that are no longer in the list
    setItems1((itemState) =>
      itemState.filter((item) => itemsIncludes(items, item)),
    );
    setItems2((itemState) =>
      itemState.filter((item) => itemsIncludes(items, item)),
    );
  }, [items, items1, items2, itemsPropChanged]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleDragEnd = useCallback(() => {
    onChange(items2);
  }, [items2, onChange]);

  const id = useId();

  return (
    <div className="grid grid-cols-2 grid-flow-row gap-x-6">
      <DndContext
        id={id}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={({ active, over }) => {
          if (!over) return;

          const activeItem = (active.data.current as { item: Item } | undefined)
            ?.item;
          const overItem = (over.data.current as { item: Item } | undefined)
            ?.item;

          if (!activeItem) {
            return;
          }

          assertString(active.id);
          assertString(over.id);

          const getItemsAndSetter = (item: Item) => {
            if (itemsIncludes(items1, item))
              return [items1, setItems1] as const;
            if (itemsIncludes(items2, item))
              return [items2, setItems2] as const;
            return [null, null] as const;
          };

          const getItemsAndSetterByDroppableId = (id: string) => {
            if (id === 'droppable') return [items1, setItems1] as const;
            if (id === 'droppable2') return [items2, setItems2] as const;
            return [null, null] as const;
          };

          const [, setActiveItems] = getItemsAndSetter(activeItem);
          const [overItems, setOverItems] = overItem
            ? getItemsAndSetter(overItem)
            : getItemsAndSetterByDroppableId(over.id);

          if (!setOverItems || !setActiveItems) {
            return;
          }

          const overIndex = overItem ? overItems.indexOf(overItem) : -1;
          let newIndex: number;

          if (over.id === 'droppable' || over.id === 'droppable2') {
            newIndex = overItems.length;
          } else {
            const isBelowOverItem =
              over &&
              active.rect.current.translated &&
              active.rect.current.translated.top >
                over.rect.top + over.rect.height;

            const modifier = isBelowOverItem ? 1 : 0;

            newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length;
          }
          setActiveItems((items) =>
            items.filter((item) => item !== activeItem),
          );
          setOverItems((items) => {
            assertString(active.id);
            return [
              ...items.slice(0, newIndex),
              activeItem,
              ...items.slice(newIndex, items.length),
            ];
          });
        }}
      >
        <SortableContext items={items1} strategy={verticalListSortingStrategy}>
          <Droppable id={'droppable'} className="row-start-2">
            {items1.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
          </Droppable>
        </SortableContext>

        <Typography variant="h3" className="col-start-2">
          {rankDimension.labelEnd}
        </Typography>
        <SortableContext items={items2} strategy={verticalListSortingStrategy}>
          <Droppable id={'droppable2'} className="col-start-2">
            {items2.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
          </Droppable>
        </SortableContext>
        <Typography variant="h3" className="col-start-2">
          {rankDimension.labelStart}
        </Typography>
      </DndContext>
    </div>
  );
}
