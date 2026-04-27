import { Item } from '@/core/Item';
import { RankAssignment } from '@/core/RankAssignment';
import { RankDimension } from '@/core/RankDimension';
import { State, Store } from '@/core/State';
import { User } from '@/core/User';

export class TestStore implements Store {
  constructor(
    public items: Item[] = [],
    public dimensions: RankDimension[] = [],
    public users: User[] = [],
    readonly rankingsByUser: Record<string, Record<string, string[]>> = {},
    readonly dimensionWeights: Record<string, number> = {},
  ) {}

  removeUsers(...users: User[]) {
    const ids = new Set(users.map((u) => u.id));
    this.users = this.users.filter((user) => !ids.has(user.id));
    for (const id of ids) {
      delete this.rankingsByUser[id];
    }
  }

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

  renameUser(userId: string, name: string): void {
    this.users = this.users.map((u) => (u.id === userId ? { ...u, name } : u));
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

  editDimension(updated: RankDimension) {
    const index = this.dimensions.findIndex((d) => d.id === updated.id);
    if (index === -1) {
      throw new Error(`Dimension ${updated.id} not found`);
    }
    this.dimensions[index] = updated;
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

  replaceItems(items: Item[]) {
    const nextIds = new Set(items.map((i) => i.id));
    const removedIds = new Set(
      this.items.filter((i) => !nextIds.has(i.id)).map((i) => i.id),
    );
    this.items = [...items];
    if (removedIds.size === 0) return;
    for (const userId of Object.keys(this.rankingsByUser)) {
      const byDim = this.rankingsByUser[userId];
      if (!byDim) continue;
      for (const dimId of Object.keys(byDim)) {
        const arr = byDim[dimId];
        if (!arr) continue;
        byDim[dimId] = arr.filter((id) => !removedIds.has(id));
      }
    }
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
