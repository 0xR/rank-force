import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Item } from '../core/Item';

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

function useChanged<T>(value: T): boolean {
  const ref = useRef<T>(value);
  const isFirstRender = useRef(true);
  const changed = ref.current !== value;

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      ref.current = value;
    }
  }, [value]);

  return changed;
}

export function Sortable({
  items,
  onChange,
}: {
  items: Item[];
  onChange: (items: Item[]) => void;
}) {
  const [items1, setItems1] = useState(items);
  const [items2, setItems2] = useState<Item[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const itemsPropChanged = useChanged(items);

  useEffect(() => {
    if (!itemsPropChanged) return;
    const newItems = items.filter(
      (item) => !items1.includes(item) && !items2.includes(item),
    );
    if (newItems.length) {
      setItems1((items) => [...items, ...newItems]);
    }
    // remove items that are no longer in the list
    setItems1((itemState) => itemState.filter((item) => items.includes(item)));
    setItems2((itemState) => itemState.filter((item) => items.includes(item)));
  }, [items, items1, items2, itemsPropChanged]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleDragEnd = useCallback(() => {
    onChange(items2);
  }, [items2, onChange]);
  
  const id = useId();

  return (
    <div>
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
            if (items1.includes(item)) return [items1, setItems1] as const;
            if (items2.includes(item)) return [items2, setItems2] as const;
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
          <Droppable id={'droppable'}>
            {items1.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
          </Droppable>
        </SortableContext>

        <SortableContext items={items2} strategy={verticalListSortingStrategy}>
          <Droppable id={'droppable2'}>
            {items2.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
          </Droppable>
        </SortableContext>
      </DndContext>
    </div>
  );
}
