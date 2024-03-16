class RankDimension {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly labelStart: string,
    readonly labelEnd: string,
    readonly direction: 'ascending' | 'descending',
    readonly importance: Ratio = new Ratio(1),
  ) {}
}

class Item {
  constructor(
    readonly id: number,
    readonly label: string,
  ) {}
}

class User {
  constructor(
    readonly id: string,
    readonly name: string,
  ) {}
}

class RankScore {
  constructor(
    readonly item: Item,
    readonly score: Ratio,
  ) {}
}

class UserRanking {
  private rankings: Map<RankDimension, RankScore[]> = new Map();

  rank(dimension: RankDimension, items: Item[]) {
    const descendingItems =
      dimension.direction === 'descending' ? items : items.toReversed();
    const score = descendingItems.map(
      (item, index) =>
        new RankScore(item, new Ratio(1 - index / (items.length - 1))),
    );
    this.rankings.set(dimension, score);
  }

  score(rankAssignment: RankAssignment) {
    return rankAssignment.items.map((item) => {
      const scoreValue = rankAssignment.dimensions.reduce(
        (score, dimension) => {
          const ranking = this.rankings.get(dimension);
          if (!ranking) {
            throw new Error(
              `Ranking not found for dimension ${dimension.name}`,
            );
          }
          const rankScore = ranking.find(
            (rankScore) => rankScore.item === item,
          );
          if (!rankScore) {
            throw new Error(`Ranking not found for item ${item.label}`);
          }
          return (
            score +
            (rankScore.score.value * dimension.importance.value) /
              rankAssignment.dimensions.length
          );
        },
        0,
      );
      return new RankScore(item, new Ratio(scoreValue));
    });
  }

  rankingComplete(rankAssignment: RankAssignment) {
    return (
      this.rankings.size === rankAssignment.dimensions.length &&
      Array.from(this.rankings.values()).every(
        (ranking) => ranking.length === rankAssignment.items.length,
      )
    );
  }
}

class RankAssignment {
  readonly items: Item[] = [];
  readonly dimensions: RankDimension[] = [];

  private rankingsByUser: Map<User, UserRanking> = new Map();

  constructor() {}

  addItems(items: string[]) {
    const startId = this.items.length;
    this.items.push(
      ...items.map((item, index) => new Item(startId + index, item)),
    );
  }

  rank(user: User, dimension: RankDimension, items: Item[]) {
    if (!this.dimensions.includes(dimension)) {
      throw new Error(`Dimension ${dimension.name} not found in assigment`);
    }
    if (items.length !== this.items.length) {
      throw new Error('Ranking length does not match item length');
    }
    items.forEach((item) => {
      if (!this.items.includes(item)) {
        throw new Error(`Item ${item.label} not found in assignment`);
      }
    });
    const userRanking = this.rankingsByUser.get(user) ?? new UserRanking();
    userRanking.rank(dimension, items);
    this.rankingsByUser.set(user, userRanking);
  }

  get score() {
    if (!this.rankingComplete) {
      throw new Error('Ranking not complete');
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

  addDimension(...rankDimension: RankDimension[]) {
    this.dimensions.push(...rankDimension);
  }
}

class Ratio {
  constructor(readonly value: number) {
    if (value < 0 || value > 1) {
      throw new Error('Score must be between 0 and 1');
    }
  }
}

describe('Domain', () => {
  it('should rank on a single dimension', () => {
    const user = new User('0', 'user 0');
    const rankDimension = new RankDimension(
      '0',
      'importance',
      'low',
      'high',
      'ascending',
    );
    const rankAssignment = new RankAssignment();
    rankAssignment.addDimension(rankDimension);
    rankAssignment.addItems(['item1', 'item2', 'item3']);
    rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[2],
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.score).toEqual([
      new RankScore(new Item(1, 'item2'), new Ratio(1)),
      new RankScore(new Item(0, 'item1'), new Ratio(0.5)),
      new RankScore(new Item(2, 'item3'), new Ratio(0)),
    ]);
  });

  it('should rank on a single descending dimension', () => {
    const user = new User('0', 'user 0');
    const rankDimension = new RankDimension(
      '0',
      'importance',
      'high',
      'low',
      'descending',
    );
    const rankAssignment = new RankAssignment();
    rankAssignment.addDimension(rankDimension);
    rankAssignment.addItems(['item1', 'item2', 'item3']);
    rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[2],
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.score).toEqual([
      new RankScore(new Item(2, 'item3'), new Ratio(1)),
      new RankScore(new Item(0, 'item1'), new Ratio(0.5)),
      new RankScore(new Item(1, 'item2'), new Ratio(0)),
    ]);
  });

  it('should rank on multiple dimensions', () => {
    const user = new User('0', 'user 0');
    const rankDimension1 = new RankDimension(
      '0',
      'importance',
      'low',
      'high',
      'ascending',
    );
    const rankDimension2 = new RankDimension(
      '0',
      'urgency',
      'low',
      'high',
      'ascending',
    );
    const rankAssignment = new RankAssignment();
    rankAssignment.addDimension(rankDimension1, rankDimension2);
    rankAssignment.addItems(['item1', 'item2', 'item3']);
    rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[2],
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);

    rankAssignment.rank(user, rankAssignment.dimensions[1], [
      rankAssignment.items[1],
      rankAssignment.items[0],
      rankAssignment.items[2],
    ]);
    expect(rankAssignment.score.map((score) => score.score)).toEqual([
      new Ratio(0.5),
      new Ratio(0.5),
      new Ratio(0.5),
    ]);
  });

  it('should rank for multiple users', () => {
    const user1 = new User('0', 'user 0');
    const user2 = new User('1', 'user 1');
    const rankDimension1 = new RankDimension(
      '0',
      'importance',
      'low',
      'high',
      'ascending',
    );
    const rankAssignment = new RankAssignment();
    rankAssignment.addDimension(rankDimension1);

    rankAssignment.addItems(['item1', 'item2']);
    rankAssignment.rank(user1, rankAssignment.dimensions[0], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    rankAssignment.rank(user2, rankAssignment.dimensions[0], [
      rankAssignment.items[1],
      rankAssignment.items[0],
    ]);

    expect(rankAssignment.score.map((score) => score.score)).toEqual([
      new Ratio(0.5),
      new Ratio(0.5),
    ]);
  });

  it('should rank supporting importance', () => {
    const user = new User('0', 'user 0');
    const rankDimension1 = new RankDimension(
      '0',
      'importance',
      'low',
      'high',
      'ascending',
      new Ratio(1),
    );
    const rankDimension2 = new RankDimension(
      '0',
      'urgency',
      'low',
      'high',
      'ascending',
      new Ratio(0.5),
    );
    const rankAssignment = new RankAssignment();
    rankAssignment.addDimension(rankDimension1, rankDimension2);
    rankAssignment.addItems(['item1', 'item2']);
    rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);

    rankAssignment.rank(user, rankAssignment.dimensions[1], [
      rankAssignment.items[1],
      rankAssignment.items[0],
    ]);
    expect(rankAssignment.score).toEqual([
      new RankScore(new Item(1, 'item2'), new Ratio(0.5)),
      new RankScore(new Item(0, 'item1'), new Ratio(0.25)),
    ]);
  });

  it('should support adding items and dimensions', () => {
    const user = new User('0', 'user 0');
    const rankDimension1 = new RankDimension(
      '0',
      'importance',
      'low',
      'high',
      'ascending',
      new Ratio(1),
    );
    const rankDimension2 = new RankDimension(
      '0',
      'urgency',
      'low',
      'high',
      'ascending',
      new Ratio(0.5),
    );
    const rankAssignment = new RankAssignment();
    rankAssignment.addDimension(rankDimension1, rankDimension2);

    expect(rankAssignment.rankingComplete).toBe(false);
    expect(() => rankAssignment.score).toThrowError('Ranking not complete');
    rankAssignment.rank(user, rankAssignment.dimensions[0], []);

    rankAssignment.rank(user, rankAssignment.dimensions[1], []);
    expect(rankAssignment.rankingComplete).toBe(true);
    expect(rankAssignment.score).toHaveLength(0);

    rankAssignment.addItems(['item1', 'item2']);
    expect(rankAssignment.rankingComplete).toBe(false);
    expect(() => rankAssignment.score).toThrowError('Ranking not complete');
    rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.rankingComplete).toBe(false);

    rankAssignment.rank(user, rankAssignment.dimensions[1], [
      rankAssignment.items[1],
      rankAssignment.items[0],
    ]);
    expect(rankAssignment.rankingComplete).toBe(true);
    expect(rankAssignment.score).toHaveLength(2);

    rankAssignment.addDimension(
      new RankDimension(
        '0',
        'complexity',
        'low',
        'high',
        'ascending',
        new Ratio(0.5),
      ),
    );
    expect(rankAssignment.rankingComplete).toBe(false);
    expect(() => rankAssignment.score).toThrowError('Ranking not complete');
    rankAssignment.rank(user, rankAssignment.dimensions[2], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.rankingComplete).toBe(true);
  });

  it('should give items unique ids', () => {
    const rankAssignment = new RankAssignment();
    rankAssignment.addItems(['item1', 'item2']);
    rankAssignment.addItems(['item3', 'item4']);
    expect(rankAssignment.items[0].id).toBe(0);
    expect(rankAssignment.items[1].id).toBe(1);
    expect(rankAssignment.items[2].id).toBe(2);
    expect(rankAssignment.items[3].id).toBe(3);
  });
});
