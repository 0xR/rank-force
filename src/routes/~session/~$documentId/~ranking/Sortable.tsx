import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { useChanged } from '@/routes/~session/~$documentId/~ranking/UseChanged';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ArrowUp } from 'lucide-react';
import { ReactNode, useEffect, useId, useRef, useState } from 'react';

import { SortableItem } from './SortableItem';
import { UnrankedItem } from './UnrankedItem';

const UNRANKED_ZONE = 'unranked-zone';
const RANKED_ZONE = 'ranked-zone';

function shuffle<T>(input: readonly T[]): T[] {
  const out = input.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function Zone({
  id,
  children,
  empty,
}: {
  id: string;
  children: ReactNode;
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
          : 'bg-space-1 border-space-4 ')
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
    shuffle(items.filter((item) => !Item.includes(initialRanking, item))),
  );
  const [ranked, setRanked] = useState<Item[]>(initialRanking);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

  const itemsPropChanged = useChanged(items);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!itemsPropChanged) return;
    const nextRanked = ranked.filter((item) => Item.includes(items, item));
    const known = new Set([
      ...unranked.map((i) => i.id),
      ...nextRanked.map((i) => i.id),
    ]);
    const additions = items.filter((item) => !known.has(item.id));
    const nextUnranked = unranked
      .filter((item) => Item.includes(items, item))
      .concat(additions);
    if (nextUnranked.length !== unranked.length) setUnranked(nextUnranked);
    if (nextRanked.length !== ranked.length) {
      setRanked(nextRanked);
      onChangeRef.current(nextRanked);
    }
  }, [items, ranked, unranked, itemsPropChanged]);

  const promote = (item: Item) => {
    const nextRanked = [...ranked, item];
    setRanked(nextRanked);
    setUnranked(unranked.filter((i) => i.id !== item.id));
    onChange(nextRanked);
  };

  const unrank = (item: Item) => {
    const nextRanked = ranked.filter((i) => i.id !== item.id);
    setRanked(nextRanked);
    setUnranked([...unranked, item]);
    onChange(nextRanked);
  };

  const containerOf = (item: Item): 'ranked' | 'unranked' | null =>
    ranked.some((i) => i.id === item.id)
      ? 'ranked'
      : unranked.some((i) => i.id === item.id)
        ? 'unranked'
        : null;

  const resolveOverContainer = (
    over: DragOverEvent['over'] | DragEndEvent['over'],
  ): 'ranked' | 'unranked' | null => {
    if (!over) return null;
    const overItem = (over.data.current as { item?: Item } | undefined)?.item;
    if (overItem) return containerOf(overItem);
    const id = String(over.id);
    if (id === RANKED_ZONE) return 'ranked';
    if (id === UNRANKED_ZONE) return 'unranked';
    return null;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    const activeItem = (active.data.current as { item?: Item } | undefined)
      ?.item;
    if (!activeItem) return;

    const activeContainer = containerOf(activeItem);
    const overContainer = resolveOverContainer(over);
    if (!activeContainer || !overContainer) return;
    if (activeContainer === overContainer) return;

    const overItem = (over.data.current as { item?: Item } | undefined)?.item;
    const overList = overContainer === 'ranked' ? ranked : unranked;
    let newIndex: number;
    if (overItem) {
      const overIndex = overList.findIndex((i) => i.id === overItem.id);
      const isBelowOverItem =
        active.rect.current.translated &&
        active.rect.current.translated.top > over.rect.top + over.rect.height;
      const modifier = isBelowOverItem ? 1 : 0;
      newIndex = overIndex >= 0 ? overIndex + modifier : overList.length;
    } else {
      newIndex = overList.length;
    }

    const fromList = activeContainer === 'ranked' ? ranked : unranked;
    const fromNext = fromList.filter((i) => i.id !== activeItem.id);
    const toNext = [
      ...overList.slice(0, newIndex),
      activeItem,
      ...overList.slice(newIndex),
    ];
    if (activeContainer === 'ranked') {
      setRanked(fromNext);
      setUnranked(toNext);
    } else {
      setUnranked(fromNext);
      setRanked(toNext);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    const activeItem = (active.data.current as { item?: Item } | undefined)
      ?.item;
    if (!activeItem) {
      onChange(ranked);
      return;
    }

    const activeContainer = containerOf(activeItem);
    const overContainer = resolveOverContainer(over);

    let nextRanked = ranked;
    if (
      activeContainer === 'ranked' &&
      overContainer === 'ranked' &&
      over &&
      active.id !== over.id
    ) {
      const overItem = (over.data.current as { item?: Item } | undefined)?.item;
      if (overItem) {
        const fromIndex = ranked.findIndex((i) => i.id === activeItem.id);
        const toIndex = ranked.findIndex((i) => i.id === overItem.id);
        if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
          nextRanked = arrayMove(ranked, fromIndex, toIndex);
          setRanked(nextRanked);
        }
      }
    }
    onChange(nextRanked);
  };

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
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
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
            <Zone
              id={UNRANKED_ZONE}
              empty={
                unranked.length === 0 ? (
                  <p className="text-2xs font-mono uppercase tracking-coord text-space-5 px-2 py-1">
                    All items ranked
                  </p>
                ) : null
              }
            >
              {unranked.map((item) => (
                <UnrankedItem
                  key={item.id}
                  item={item}
                  onPromote={() => promote(item)}
                />
              ))}
            </Zone>
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
            <Zone
              id={RANKED_ZONE}
              empty={
                ranked.length === 0 ? (
                  <p className="text-2xs font-mono uppercase tracking-coord text-space-5 px-2 py-1">
                    Tap an item to start ranking
                  </p>
                ) : null
              }
            >
              {ranked.map((item, i) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  rank={i + 1}
                  onRemove={() => unrank(item)}
                />
              ))}
            </Zone>
          </SortableContext>
          <div className="text-2xs font-mono uppercase tracking-coord text-space-5 text-right">
            {worse}
          </div>
        </div>
      </div>
    </DndContext>
  );
}
