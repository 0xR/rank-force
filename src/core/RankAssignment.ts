import { instanceToPlain } from 'class-transformer';
import { Item } from './Item';
import { RankDimension } from './RankDimension';
import { RankScore } from './RankScore';
import { Ratio } from './Ratio';
import { User } from './User';
import { UserRanking } from './UserRanking';

export interface State {
  readonly items: Item[];
  readonly dimensions: RankDimension[];
  readonly users: User[];
  readonly rankingsByUser: Record<string, Record<string, string[]>>;
}

export function stateToPlainObject(state: State): Record<string, any> {
  return {
    items: state.items.map((item) => instanceToPlain(item)),
    dimensions: state.dimensions.map((dimension) => instanceToPlain(dimension)),
    users: state.users.map((user) => instanceToPlain(user)),
    rankingsByUser: state.rankingsByUser,
  };
}

export interface Mutators {
  addItems(...items: Item[]): void;

  addDimension(...dimensions: RankDimension[]): void;

  removeDimensions(...dimensions: RankDimension[]): void;

  addUsers(...users: User[]): void;

  removeItems(...items: Item[]): void;

  setUserRanking(userId: string, dimennsionId: string, itemIds: string[]): void;
}

export type Store = State & Mutators;

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
  }
}
