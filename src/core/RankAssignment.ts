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

  get users() {
    return this.store.users;
  }

  hasRankings(userId: string): boolean {
    const byDimension = this.store.rankingsByUser[userId];
    if (!byDimension) return false;
    return Object.values(byDimension).some((ids) => ids.length > 0);
  }

  get firstUser(): User | undefined {
    return this.store.users[0];
  }

  addItems(...items: string[]) {
    this.store.addItems(...items.map((label) => Item.make(label)));
  }

  addDimension(...rankDimensions: RankDimension[]) {
    if (rankDimensions.length === 0) return;

    const existingDimensions = [...this.store.dimensions];
    const totalCount = existingDimensions.length + rankDimensions.length;
    const newWeight = 1 / totalCount;
    const existingScale = existingDimensions.length / totalCount;

    rankDimensions.forEach((dimension) => {
      this.store.addDimension(dimension);
      this.store.setDimensionWeight(dimension.id, newWeight);
    });

    existingDimensions.forEach((dimension) => {
      const current = this.store.dimensionWeights[dimension.id] ?? 0;
      this.store.setDimensionWeight(dimension.id, current * existingScale);
    });
  }

  editDimension(updated: RankDimension) {
    this.store.editDimension(updated);
  }

  removeDimensions(...dimensions: RankDimension[]) {
    this.store.removeDimensions(...dimensions);

    Array.from(this.rankingsByUser.values()).forEach((userRanking) => {
      userRanking.removeDimensions(...dimensions);
    });

    if (dimensions[0]) {
      this.store.setDimensionWeight(dimensions[0].id, undefined);
    }
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
      if (!Item.includes(this.store.items, item)) {
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

    const scoresForUsers = Array.from(this.rankingsByUser.values())
      .filter((userRanking) => userRanking.rankingComplete(this.store))
      .map((userRanking) => userRanking.score(this.store));
    const scores = this.store.items.map((item, index) => {
      const scoreValue = scoresForUsers.reduce(
        (score, userScores) => score + userScores[index]!.score.value,
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
    return Array.from(this.rankingsByUser.values()).some((userRanking) =>
      userRanking.rankingComplete(this.store),
    );
  }

  removeItems(...items: Item[]) {
    this.store.removeItems(...items);
    for (const userRanking of this.rankingsByUser.values()) {
      userRanking.removeItems(...items);
    }
  }

  replaceItems(labels: string[]) {
    const trimmed = labels
      .map((label) => label.trim())
      .filter((label) => label.length > 0);
    const seen = new Set<string>();
    const unique: string[] = [];
    for (const label of trimmed) {
      if (seen.has(label)) continue;
      seen.add(label);
      unique.push(label);
    }

    const existingByLabel = new Map<string, Item>();
    for (const item of this.store.items) {
      if (!existingByLabel.has(item.label))
        existingByLabel.set(item.label, item);
    }

    const next = unique.map(
      (label) => existingByLabel.get(label) ?? Item.make(label),
    );
    this.store.replaceItems(next);
  }

  addUser(user: User) {
    this.store.addUsers(user);
  }

  removeUsers(...users: User[]) {
    this.store.removeUsers(...users);
  }

  renameUser(userId: string, name: string) {
    this.store.renameUser(userId, name);
    const existing = this.usersById.get(userId);
    if (existing) {
      this.usersById.set(userId, { ...existing, name });
    }
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
