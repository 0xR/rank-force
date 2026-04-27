import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { Mutators, State } from '@/core/State';
import { User } from '@/core/User';
import { AnyDocumentId } from '@automerge/automerge-repo';
import { useDocument } from '@automerge/automerge-repo-react-hooks';
import { useMemo } from 'react';

export type SharedStore = Mutators & {
  doc: State;
};

export const draftMutators = {
  addItems(d: State, items: Item[]) {
    d.items.push(...items);
  },
  addDimension(d: State, dimensions: RankDimension[]) {
    d.dimensions.push(...dimensions);
  },
  addUsers(d: State, users: User[]) {
    d.users.push(...users);
  },
  removeUsers(d: State, users: User[]) {
    const ids = new Set(users.map((u) => u.id));
    for (let i = d.users.length - 1; i >= 0; i--) {
      if (ids.has(d.users[i]!.id)) (d.users as User[]).splice(i, 1);
    }
    for (const id of ids) {
      delete d.rankingsByUser[id];
    }
  },
  renameUser(d: State, userId: string, name: string) {
    const user = d.users.find((u) => u.id === userId);
    if (user) {
      (user as { name: string }).name = name;
    }
  },
  removeItems(d: State, items: Item[]) {
    const ids = new Set(items.map((i) => i.id));
    for (let i = d.items.length - 1; i >= 0; i--) {
      if (ids.has(d.items[i]!.id)) (d.items as Item[]).splice(i, 1);
    }
  },
  removeDimensions(d: State, dimensions: RankDimension[]) {
    const ids = new Set(dimensions.map((x) => x.id));
    for (let i = d.dimensions.length - 1; i >= 0; i--) {
      if (ids.has(d.dimensions[i]!.id))
        (d.dimensions as RankDimension[]).splice(i, 1);
    }
  },
  setUserRanking(
    d: State,
    userId: string,
    dimensionId: string,
    itemIds: string[] | undefined,
  ) {
    if (!d.rankingsByUser[userId]) {
      d.rankingsByUser[userId] = {};
    }
    if (itemIds) {
      d.rankingsByUser[userId][dimensionId] = [...itemIds];
    } else {
      delete d.rankingsByUser[userId][dimensionId];
    }
  },
  setDimensionWeight(
    d: State,
    dimensionId: string,
    weight: number | undefined,
  ) {
    if (weight === undefined) {
      delete d.dimensionWeights[dimensionId];
    } else {
      d.dimensionWeights[dimensionId] = weight;
    }
  },
};

export function useSessionStore(docUrl: AnyDocumentId): SharedStore {
  const [doc, changeDoc] = useDocument<State>(docUrl, { suspense: true });

  return useMemo<SharedStore>(
    () => ({
      doc,
      addItems: (...items) =>
        changeDoc((d) => draftMutators.addItems(d, items)),
      addDimension: (...dimensions) =>
        changeDoc((d) => draftMutators.addDimension(d, dimensions)),
      addUsers: (...users) =>
        changeDoc((d) => draftMutators.addUsers(d, users)),
      removeUsers: (...users) =>
        changeDoc((d) => draftMutators.removeUsers(d, users)),
      renameUser: (userId, name) =>
        changeDoc((d) => draftMutators.renameUser(d, userId, name)),
      removeItems: (...items) =>
        changeDoc((d) => draftMutators.removeItems(d, items)),
      removeDimensions: (...dimensions) =>
        changeDoc((d) => draftMutators.removeDimensions(d, dimensions)),
      setUserRanking: (userId, dimensionId, itemIds) =>
        changeDoc((d) =>
          draftMutators.setUserRanking(d, userId, dimensionId, itemIds),
        ),
      setDimensionWeight: (dimensionId, weight) =>
        changeDoc((d) =>
          draftMutators.setDimensionWeight(d, dimensionId, weight),
        ),
    }),
    [doc, changeDoc],
  );
}
