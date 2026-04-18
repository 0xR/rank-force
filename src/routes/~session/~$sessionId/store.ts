import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { Mutators, State } from '@/core/State';
import { User } from '@/core/User';
import * as Automerge from '@automerge/automerge';
import { create } from 'zustand';

export type SharedStore = Mutators & {
  doc: Automerge.Doc<State>;
};

function emptyDoc(): Automerge.Doc<State> {
  return Automerge.from<State>({
    items: [],
    dimensions: [],
    users: [],
    rankingsByUser: {},
    dimensionWeights: {},
  });
}

const mutate = (
  doc: Automerge.Doc<State>,
  fn: (draft: State) => void,
): Pick<SharedStore, 'doc'> => ({
  doc: Automerge.change(doc, fn),
});

export const useSharedStore = create<SharedStore>((set) => ({
  doc: emptyDoc(),

  addItems: (...items: Item[]) =>
    set((s) =>
      mutate(s.doc, (d) => {
        d.items.push(...items);
      }),
    ),

  addDimension: (...dimensions: RankDimension[]) =>
    set((s) =>
      mutate(s.doc, (d) => {
        d.dimensions.push(...dimensions);
      }),
    ),

  addUsers: (...users: User[]) =>
    set((s) =>
      mutate(s.doc, (d) => {
        d.users.push(...users);
      }),
    ),

  removeItems: (...items: Item[]) =>
    set((s) =>
      mutate(s.doc, (d) => {
        const ids = new Set(items.map((i) => i.id));
        for (let i = d.items.length - 1; i >= 0; i--) {
          if (ids.has(d.items[i].id)) d.items.splice(i, 1);
        }
      }),
    ),

  removeDimensions: (...dimensions: RankDimension[]) =>
    set((s) =>
      mutate(s.doc, (d) => {
        const ids = new Set(dimensions.map((x) => x.id));
        for (let i = d.dimensions.length - 1; i >= 0; i--) {
          if (ids.has(d.dimensions[i].id)) d.dimensions.splice(i, 1);
        }
      }),
    ),

  setUserRanking: (userId, dimensionId, itemIds) =>
    set((s) =>
      mutate(s.doc, (d) => {
        if (!d.rankingsByUser[userId]) {
          d.rankingsByUser[userId] = {};
        }
        if (itemIds) {
          d.rankingsByUser[userId][dimensionId] = [...itemIds];
        } else {
          delete d.rankingsByUser[userId][dimensionId];
        }
      }),
    ),

  setDimensionWeight: (dimensionId, weight) =>
    set((s) =>
      mutate(s.doc, (d) => {
        if (weight === undefined) {
          delete d.dimensionWeights[dimensionId];
        } else {
          d.dimensionWeights[dimensionId] = weight;
        }
      }),
    ),
}));

export function useDoc<T>(selector: (state: State) => T): T {
  return useSharedStore((s) => selector(s.doc));
}

export function resetSharedStore() {
  useSharedStore.setState({ doc: emptyDoc() });
}
