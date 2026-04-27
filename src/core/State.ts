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
  removeDimensions(...dimensions: RankDimension[]): void;
  addUsers(...users: User[]): void;
  removeUsers(...users: User[]): void;
  removeItems(...items: Item[]): void;
  setUserRanking(
    userId: string,
    dimensionId: string,
    itemIds: string[] | undefined,
  ): void;
  setDimensionWeight(dimensionId: string, weight: number | undefined): void;
};

export type Store = State & Mutators;
