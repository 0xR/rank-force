import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { User } from '@/core/User';

export type State = {
  readonly items: Item[];
  readonly dimensions: RankDimension[];
  readonly users: User[];
  // userId -> dimensionId -> itemIds
  readonly rankingsByUser: Record<string, Record<string, string[]>>;
  readonly dimensionWeights: Record<string, number>;
};

export type Mutators = {
  addItems(...items: Item[]): void;
  addDimension(...dimensions: RankDimension[]): void;
  editDimension(updated: RankDimension): void;
  removeDimensions(...dimensions: RankDimension[]): void;
  addUsers(...users: User[]): void;
  removeUsers(...users: User[]): void;
  renameUser(userId: string, name: string): void;
  renameItem(id: string, label: string): void;
  removeItems(...items: Item[]): void;
  replaceItems(items: Item[]): void;
  setUserRanking(
    userId: string,
    dimensionId: string,
    itemIds: string[] | undefined,
  ): void;
  setDimensionWeight(dimensionId: string, weight: number | undefined): void;
};

export type Store = State & Mutators;

/**
 * Drop every reference to a removed item id from a `rankingsByUser` map,
 * mutating the nested arrays in place. `items` is authoritative, so a ranking
 * must never outlive the items it points at.
 */
export function scrubRemovedItemIds(
  rankingsByUser: Record<string, Record<string, string[]>>,
  removedIds: Set<string>,
): void {
  if (removedIds.size === 0) return;
  for (const userId of Object.keys(rankingsByUser)) {
    const byDim = rankingsByUser[userId];
    if (!byDim) continue;
    for (const dimId of Object.keys(byDim)) {
      const arr = byDim[dimId];
      if (!arr) continue;
      for (let i = arr.length - 1; i >= 0; i--) {
        if (removedIds.has(arr[i]!)) arr.splice(i, 1);
      }
    }
  }
}
