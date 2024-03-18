import type { DragEndEvent } from '@dnd-kit/core/dist/types';
import { useCallback, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SortableItem } from './SortableItem';

function assertString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Expected a string');
  }
}

function Droppable({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { setNodeRef } = useDroppable({
    id,
  });
  return (
    <div
      style={{
        border: '1px solid black',
        height: '100px',
        margin: '10px',
      }}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}

export function Sortable() {
  const [items1, setItems1] = useState(['1', '2', '3']);
  const [items2, setItems2] = useState(['4', '5', '6']);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over) return;

      const setItems = items1.includes(active.id) ? setItems1 : setItems2;

      if (active.id !== over.id) {
        setItems((items) => {
          assertString(over.id);
          assertString(active.id);
          const oldIndex = items.indexOf(active.id);
          const newIndex = items.indexOf(over.id);

          return arrayMove(items, oldIndex, newIndex);
        });
      }
    },
    [items1],
  );

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={({ active, over }) => {
          if (!over) return;

          assertString(active.id);
          assertString(over.id);

          const getItemsAndSetter = (id: string) => {
            if (items1.includes(id)) return [items1, setItems1] as const;
            if (items2.includes(id)) return [items2, setItems2] as const;
            if (id === 'droppable') return [items1, setItems1] as const;
            if (id === 'droppable2') return [items2, setItems2] as const;
            return [null, null] as const;
          };

          const [activeItems, setActiveItems] = getItemsAndSetter(active.id);
          const [overItems, setOverItems] = getItemsAndSetter(over.id);

          if (activeItems === overItems || !setOverItems || !setActiveItems) {
            return;
          }

          const overIndex = overItems.indexOf(over.id);
          let newIndex: number;

          if (over.id === 'droppable' || over.id === 'droppable2') {
            newIndex = overItems.length + 1;
          } else {
            const isBelowOverItem =
              over &&
              active.rect.current.translated &&
              active.rect.current.translated.top >
                over.rect.top + over.rect.height;

            const modifier = isBelowOverItem ? 1 : 0;

            newIndex =
              overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
          }
          setActiveItems((items) => items.filter((id) => id !== active.id));
          setOverItems((items) => {
            assertString(active.id);
            return [
              ...items.slice(0, newIndex),
              active.id,
              ...items.slice(newIndex, items.length),
            ];
          });
        }}
      >
        <SortableContext items={items1} strategy={verticalListSortingStrategy}>
          <Droppable id={'droppable'}>
            {items1.map((id) => (
              <SortableItem key={id} id={id} />
            ))}
          </Droppable>
        </SortableContext>

        <SortableContext items={items2} strategy={verticalListSortingStrategy}>
          <Droppable id={'droppable2'}>
            {items2.map((id) => (
              <SortableItem key={id} id={id} />
            ))}
          </Droppable>
        </SortableContext>
      </DndContext>
    </div>
  );
}
