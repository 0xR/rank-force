import { Store } from '@/core/State';
import { Item } from './Item';
import { RankDimension } from './RankDimension';
import { RankScore } from './RankScore';
import { Ratio } from './Ratio';
import { User } from './User';
import { UserRanking } from './UserRanking';

export class RankAssignment {
  readonly usersById = new Map<string, User>();
  readonly rankingsByUser = new Map<User, UserRanking>();

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
    this.store.addDimension(...rankDimensions);
  }

  removeDimensions(...dimensions: RankDimension[]) {
    this.store.removeDimensions(...dimensions);
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
      if (!this.store.items.includes(item)) {
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
}
