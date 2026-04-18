import { Item } from '@/core/Item';
import { RankAssignment } from '@/core/RankAssignment';
import { RankDimension } from '@/core/RankDimension';
import { State, Store } from '@/core/State';
import { User } from '@/core/User';

export class TestStore implements Store {
  constructor(
    public items: Item[] = [],
    public dimensions: RankDimension[] = [],
    readonly users: User[] = [],
    readonly rankingsByUser: Record<string, Record<string, string[]>> = {},
    readonly dimensionWeights: Record<string, number> = {},
  ) {}

  setDimensionWeight(dimensionId: string, weight: number | undefined): void {
    if (weight === undefined) {
      delete this.dimensionWeights[dimensionId];
      return;
    }
    this.dimensionWeights[dimensionId] = weight;
  }

  addUsers(...users: User[]): void {
    this.users.push(...users);
  }

  setUserRanking(userId: string, dimensionId: string, itemIds: string[]): void {
    const userRanking = this.rankingsByUser[userId] ?? {};
    if (itemIds) {
      userRanking[dimensionId] = itemIds;
    } else {
      delete userRanking[dimensionId];
    }
    this.rankingsByUser[userId] = userRanking;
  }

  static fromState(state: State) {
    return new TestStore(
      [...state.items],
      [...state.dimensions],
      [...state.users],
      { ...state.rankingsByUser },
      { ...state.dimensionWeights },
    );
  }

  addItems(...items: Item[]) {
    this.items.push(...items);
  }

  addDimension(...dimensions: RankDimension[]) {
    this.dimensions.push(...dimensions);
  }

  removeDimensions(...dimensions: RankDimension[]) {
    this.dimensions = this.dimensions.filter(
      (dimension) => !dimensions.includes(dimension),
    );
  }

  get rankAssignment() {
    return new RankAssignment(this);
  }

  removeItems(...items: Item[]) {
    this.items = this.items.filter((item) => !items.includes(item));
  }

  toPlainObject(): State {
    return {
      items: this.items,
      dimensions: this.dimensions,
      users: this.users,
      rankingsByUser: this.rankingsByUser,
      dimensionWeights: this.dimensionWeights,
    };
  }
}
