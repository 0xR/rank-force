import { Store } from '@/core/State';
import { Item, itemsIncludes } from './Item';
import { RankDimension } from './RankDimension';
import { RankScore } from './RankScore';
import { Ratio } from './Ratio';
import { User } from './User';
import { UserRanking } from './UserRanking';

export class RankAssignment {
  readonly usersById = new Map<string, User>();
  readonly rankingsByUser = new Map<User, UserRanking>();
  readonly dimensionWeight = new Map<RankDimension, Ratio>();

  constructor(private store: Store) {
    this.usersById = new Map();
    this.store.users.forEach((user) => {
      this.usersById.set(user.id, user);
    });
    Object.entries(store.rankingsByUser).forEach(
      ([userId, itemIdsByDimensionId]) => {
        const rankingMap = new Map<RankDimension, Item[]>();
        Object.entries(itemIdsByDimensionId).forEach(
          ([dimensionId, itemIds]) => {
            const dimension = this.store.dimensions.find(
              (d) => d.id === dimensionId,
            );
            if (!dimension) {
              throw new Error(
                `Dimension ${dimensionId} not found in assignment`,
              );
            }
            const items = itemIds.map((itemId) =>
              this.store.items.find((i) => i.id === itemId),
            );
            if (items.some((item) => !item)) {
              throw new Error(`Item not found in assignment`);
            }
            rankingMap.set(dimension, items as Item[]);
          },
        );
        const userRanking = new UserRanking(
          this.store,
          this.usersById.get(userId)!,
          rankingMap,
        );
        this.rankingsByUser.set(this.usersById.get(userId)!, userRanking);
      },
    );

    Object.entries(store.dimensionWeights).forEach(([dimensionId, weight]) => {
      const dimension = this.store.dimensions.find((d) => d.id === dimensionId);
      if (!dimension) {
        throw new Error(`Dimension ${dimensionId} not found in assignment`);
      }
      this.dimensionWeight.set(dimension, new Ratio(weight));
    });
  }

  get items() {
    return this.store.items;
  }

  get dimensions() {
    return this.store.dimensions;
  }

  get firstUser(): User | undefined {
    return this.store.users[0];
  }

  addItems(...items: string[]) {
    this.store.addItems(...items.map((label) => new Item(label)));
  }

  addDimension(...rankDimensions: RankDimension[]) {
    const initialDimensionCount = this.store.dimensions.length;
    rankDimensions.forEach((dimension, i) => {
      this.store.addDimension(dimension);
      this.setDimensionWeight(
        dimension,
        new Ratio(1 / (initialDimensionCount + i + 1)),
      );
    });
  }

  removeDimensions(...dimensions: RankDimension[]) {
    this.store.removeDimensions(...dimensions);

    Array.from(this.rankingsByUser.values()).forEach((userRanking) => {
      userRanking.removeDimensions(...dimensions);
    });

    this.store.setDimensionWeight(dimensions[0].id, undefined);
  }

  rank(user: User, dimension: RankDimension, items: Item[]) {
    if (this.usersById.get(user.id) === undefined) {
      this.store.addUsers(user);
      this.usersById.set(user.id, user);
    }
    if (!this.store.dimensions.includes(dimension)) {
      throw new Error(`Dimension ${dimension.name} not found in assigment`);
    }

    items.forEach((item) => {
      if (!itemsIncludes(this.store.items, item)) {
        throw new Error(`Item ${item.label} not found in assignment`);
      }
    });

    const userRanking =
      this.rankingsByUser.get(user) ?? new UserRanking(this.store, user);

    userRanking.rank(dimension, items);

    this.rankingsByUser.set(user, userRanking);
  }

  get score() {
    if (!this.rankingComplete) {
      return undefined;
    }
    const scoresForUsers = Array.from(this.rankingsByUser.values()).map(
      (userRanking) => userRanking.score(this.store),
    );
    const scores = this.store.items.map((item, index) => {
      const scoreValue = scoresForUsers.reduce(
        (score, userScores) => score + userScores[index].score.value,
        0,
      );
      return new RankScore(item, new Ratio(scoreValue / scoresForUsers.length));
    });
    return scores.sort((a, b) => b.score.value - a.score.value);
  }

  get rankingComplete() {
    if (this.rankingsByUser.size === 0) {
      return false;
    }
    return Array.from(this.rankingsByUser.values()).every((userRanking) =>
      userRanking.rankingComplete(this.store),
    );
  }

  removeItems(...items: Item[]) {
    this.store.removeItems(...items);
    for (const userRanking of this.rankingsByUser.values()) {
      userRanking.removeItems(...items);
    }
  }

  addUser(user: User) {
    this.store.addUsers(user);
  }

  setDimensionWeight(rankDimension: RankDimension, ratio: Ratio) {
    const previousWeight = this.dimensionWeight.get(rankDimension);

    this.store.setDimensionWeight(rankDimension.id, ratio.value);
    let total = ratio.value;
    this.dimensions.forEach((dimension) => {
      if (dimension.id === rankDimension.id) {
        return;
      }
      const currentWeight = this.store.dimensionWeights[dimension.id] ?? 1;
      const newRatio =
        (currentWeight / (1 - (previousWeight?.value ?? 0))) *
        (1 - ratio.value);

      this.store.setDimensionWeight(dimension.id, newRatio);
      total += newRatio;
    });
    if (!new Ratio(total).equals(new Ratio(1))) {
      throw new Error('Dimension weights do not sum to 1');
    }
  }
}

function assertDefined<T>(value: T | undefined): asserts value is T {
  if (value === undefined) {
    throw new Error('Value is undefined');
  }
}
