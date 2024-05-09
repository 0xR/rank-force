import { Item } from '@/core/Item';
import { RankAssignment, State, Store } from '@/core/RankAssignment';
import { RankDimension } from '@/core/RankDimension';
import { User } from '@/core/User';
import { instanceToPlain } from 'class-transformer';

export class TestStore implements Store {
  constructor(
    public items: Item[] = [],
    public dimensions: RankDimension[] = [],
    readonly users: User[] = [],
    readonly rankingsByUser: Record<string, Record<string, string[]>> = {},
  ) {}

  addUsers(...users: User[]): void {
    this.users.push(...users);
  }

  setUserRanking(userId: string, dimensionId: string, itemIds: string[]): void {
    const userRanking = this.rankingsByUser[userId] ?? {};
    userRanking[dimensionId] = itemIds;
    this.rankingsByUser[userId] = userRanking;
  }

  static fromState(state: State) {
    return new TestStore(
      state.items,
      state.dimensions,
      state.users,
      state.rankingsByUser,
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

  toRankAssignment() {
    return new RankAssignment(this);
  }

  removeItems(...items: Item[]) {
    this.items = this.items.filter((item) => !items.includes(item));
  }

  toPlainObject(): Record<string, any> {
    return {
      items: this.items.map((item) => instanceToPlain(item)),
      dimensions: this.dimensions.map((dimension) =>
        instanceToPlain(dimension),
      ),
      users: this.users.map((user) => instanceToPlain(user)),
      rankingsByUser: this.rankingsByUser,
    };
  }
}
