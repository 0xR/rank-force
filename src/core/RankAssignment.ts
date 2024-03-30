import { Item } from './Item';
import { RankDimension } from './RankDimension';
import { RankScore } from './RankScore';
import { Ratio } from './Ratio';
import { User } from './User';
import { UserRanking } from './UserRanking';

export class RankAssignment {
  constructor(
    readonly items: Item[] = [],
    readonly dimensions: RankDimension[] = [],
    private rankingsByUser: Map<User, UserRanking> = new Map(),
  ) {}

  addItems(...items: string[]): RankAssignment {
    const startId = this.items.length;
    return new RankAssignment(
      this.items.concat(
        items.map(
          (label, index) => new Item((index + startId).toString(), label),
        ),
      ),
      this.dimensions,
      this.rankingsByUser,
    );
  }

  addDimension(...rankDimension: RankDimension[]): RankAssignment {
    const startId = this.dimensions.length;
    const dimensionsWithId = rankDimension.map(
      (dimension, index) =>
        new RankDimension(
          dimension.name,
          dimension.labelStart,
          dimension.labelEnd,
          dimension.direction,
          dimension.importance,
          (index + startId).toString(),
        ),
    );
    return new RankAssignment(
      this.items,
      this.dimensions.concat(dimensionsWithId),
      this.rankingsByUser,
    );
  }

  removeDimensions(...dimensions: RankDimension[]): RankAssignment {
    return new RankAssignment(
      this.items,
      this.dimensions.filter((dimension) => !dimensions.includes(dimension)),
      this.rankingsByUser,
    );
  }

  rank(user: User, dimension: RankDimension, items: Item[]): RankAssignment {
    if (!this.dimensions.includes(dimension)) {
      throw new Error(`Dimension ${dimension.name} not found in assigment`);
    }

    const rankingByUserCopy = new Map(this.rankingsByUser);

    items.forEach((item) => {
      if (!this.items.includes(item)) {
        throw new Error(`Item ${item.label} not found in assignment`);
      }
    });

    let userRanking = this.rankingsByUser.get(user) ?? new UserRanking();

    if (items.length === this.items.length) {
      userRanking = userRanking.rank(dimension, items);
    } else {
      userRanking = userRanking.unrank(dimension);
    }

    return new RankAssignment(
      this.items,
      this.dimensions,
      rankingByUserCopy.set(user, userRanking),
    );
  }

  get score() {
    if (!this.rankingComplete) {
      return undefined;
    }
    const scoresForUsers = Array.from(this.rankingsByUser.values()).map(
      (userRanking) => userRanking.score(this),
    );
    const scores = this.items.map((item, index) => {
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
      userRanking.rankingComplete(this),
    );
  }

  serialize() {
    return {
      items: this.items.map((item) => item.serialize()),
      dimensions: this.dimensions.map((dimension) => dimension.serialize()),
      rankingsByUser: Array.from(this.rankingsByUser.entries()).map(
        ([user, userRanking]) => {
          return {
            user: user.serialize(),
            ranking: userRanking.serialize(),
          };
        },
      ),
    };
  }

  copy() {
    const serialized = this.serialize();
    return RankAssignment.deserialize(serialized);
  }

  static deserialize(json: ReturnType<RankAssignment['serialize']>) {
    const rankAssignment = new RankAssignment(
      json.items.map((item) => Item.deserialize(item)),
      json.dimensions.map((dimension) => RankDimension.deserialize(dimension)),
    );

    return new RankAssignment(
      rankAssignment.items,
      rankAssignment.dimensions,
      new Map(
        json.rankingsByUser.map(({ user, ranking }) => {
          return [
            User.deserialize(user),
            UserRanking.deserialize(ranking, rankAssignment),
          ];
        }),
      ),
    );
  }

  removeItems(items: Item[]) {
    return new RankAssignment(
      this.items.filter((item) => !items.includes(item)),
      this.dimensions,
      this.rankingsByUser,
    );
  }
}
