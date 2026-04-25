import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { useChanged } from '@/routes/~session/~$sessionId/~ranking/UseChanged';
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
import { ArrowUp } from 'lucide-react';
import {
  ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';

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
  empty,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  empty?: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={
        'min-h-[120px] p-2 rounded-md border border-dashed transition-colors duration-150 ease-out-quart flex flex-col gap-1.5 ' +
        (isOver
          ? 'bg-cyan-bg/30 border-cyan/60 '
          : 'bg-space-1 border-space-4 ') +
        (className ?? '')
      }
    >
      {children}
      {empty}
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
  const [unranked, setUnranked] = useState(() =>
    items.filter((item) => !Item.includes(initialRanking, item)),
  );
  const [ranked, setRanked] = useState<Item[]>(initialRanking);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 120, tolerance: 5 },
    }),
  );

  const itemsPropChanged = useChanged(items);

  useEffect(() => {
    if (!itemsPropChanged) return;
    const newItems = items.filter(
      (item) => !Item.includes(unranked, item) && !Item.includes(ranked, item),
    );
    if (newItems.length) {
      setUnranked((prev) => [...prev, ...newItems]);
    }
    setUnranked((prev) => prev.filter((item) => Item.includes(items, item)));
    setRanked((prev) => prev.filter((item) => Item.includes(items, item)));
  }, [items, unranked, ranked, itemsPropChanged]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleDragEnd = useCallback(() => {
    onChange(ranked);
  }, [ranked, onChange]);

  const id = useId();

  const better =
    rankDimension.direction === 'ascending'
      ? rankDimension.labelEnd
      : rankDimension.labelStart;
  const worse =
    rankDimension.direction === 'ascending'
      ? rankDimension.labelStart
      : rankDimension.labelEnd;

  return (
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

        if (!activeItem) return;

        assertString(active.id);
        assertString(over.id);

        const getItemsAndSetter = (item: Item) => {
          if (Item.includes(unranked, item))
            return [unranked, setUnranked] as const;
          if (Item.includes(ranked, item)) return [ranked, setRanked] as const;
          return [null, null] as const;
        };

        const getItemsAndSetterByDroppableId = (id: string) => {
          if (id === 'droppable') return [unranked, setUnranked] as const;
          if (id === 'droppable2') return [ranked, setRanked] as const;
          return [null, null] as const;
        };

        const [, setActiveItems] = getItemsAndSetter(activeItem);
        const [overItems, setOverItems] = overItem
          ? getItemsAndSetter(overItem)
          : getItemsAndSetterByDroppableId(over.id);

        if (!setOverItems || !setActiveItems) return;

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
        setActiveItems((items) => items.filter((item) => item !== activeItem));
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Unranked column */}
        <div className="flex flex-col gap-2">
          <div className="text-2xs font-mono uppercase tracking-coord text-space-6">
            Unranked
          </div>
          <SortableContext
            items={unranked}
            strategy={verticalListSortingStrategy}
          >
            <Droppable
              id={'droppable'}
              empty={
                unranked.length === 0 ? (
                  <p className="text-2xs font-mono uppercase tracking-coord text-space-5 px-2 py-1">
                    Drag items here to remove from ranking
                  </p>
                ) : null
              }
            >
              {unranked.map((item) => (
                <SortableItem key={item.id} item={item} />
              ))}
            </Droppable>
          </SortableContext>
        </div>

        {/* Ranked column */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-2xs font-mono uppercase tracking-coord text-cyan inline-flex items-center gap-1.5">
              <ArrowUp className="h-3 w-3" strokeWidth={2} />
              {better}
            </div>
            <div className="text-2xs font-mono uppercase tracking-coord text-space-6">
              Your ranking
            </div>
          </div>
          <SortableContext
            items={ranked}
            strategy={verticalListSortingStrategy}
          >
            <Droppable
              id={'droppable2'}
              empty={
                ranked.length === 0 ? (
                  <p className="text-2xs font-mono uppercase tracking-coord text-space-5 px-2 py-1">
                    Drag items here, top to bottom
                  </p>
                ) : null
              }
            >
              {ranked.map((item, i) => (
                <SortableItem key={item.id} item={item} rank={i + 1} />
              ))}
            </Droppable>
          </SortableContext>
          <div className="text-2xs font-mono uppercase tracking-coord text-space-5 text-right">
            {worse}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
