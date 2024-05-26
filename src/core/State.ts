import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { User } from '@/core/User';

export interface State {
  readonly items: Item[];
  readonly dimensions: RankDimension[];
  readonly users: User[];
  // userId -> dimensionId -> itemIds
  readonly rankingsByUser: Record<string, Record<string, string[]>>;
}

export interface Mutators {
  addItems(...items: Item[]): void;

  addDimension(...dimensions: RankDimension[]): void;

  removeDimensions(...dimensions: RankDimension[]): void;

  addUsers(...users: User[]): void;

  removeItems(...items: Item[]): void;

  setUserRanking(
    userId: string,
    dimennsionId: string,
    itemIds: string[] | undefined,
  ): void;
}

export type Store = State & Mutators;
