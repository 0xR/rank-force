import { UserRanking } from '@/core/UserRanking';
import { expect } from 'vitest';
import { Item } from './Item';
import { RankAssignment, Store } from './RankAssignment';
import { RankDimension } from './RankDimension';
import { RankScore } from './RankScore';
import { Ratio } from './Ratio';
import { User } from './User';

class TestStore implements Store {
  constructor(
    public items: Item[] = [],
    public dimensions: RankDimension[] = [],
    public rankingsByUser: Map<User, UserRanking> = new Map(),
  ) {}

  addItems(...items: Item[]) {
    this.items.concat(items);
  }

  addDimension(...dimensions: RankDimension[]) {
    this.dimensions.concat(dimensions);
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

  setUserRanking(user: User, userRanking: UserRanking) {
    this.rankingsByUser.set(user, userRanking);
  }
}

describe('Domain', () => {
  it('should rank on a single dimension', () => {
    const user = new User('user 0');
    const rankDimension = new RankDimension(
      'importance',
      'low',
      'high',
      'ascending',
      new Ratio(1),
    );
    let rankAssignment = new RankAssignment();
    rankAssignment = rankAssignment.addDimension(rankDimension);
    rankAssignment = rankAssignment.addItems('item1', 'item2', 'item3');
    rankAssignment = rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[2],
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.score).toEqual([
      new RankScore(rankAssignment.items[1], new Ratio(1)),
      new RankScore(rankAssignment.items[0], new Ratio(0.5)),
      new RankScore(rankAssignment.items[2], new Ratio(0)),
    ]);
  });

  it('should rank on a single descending dimension', () => {
    const user = new User('user 0');
    const rankDimension = new RankDimension(
      'importance',
      'high',
      'low',
      'descending',
    );
    let rankAssignment = new RankAssignment();
    rankAssignment = rankAssignment.addDimension(rankDimension);
    rankAssignment = rankAssignment.addItems('item1', 'item2', 'item3');
    rankAssignment = rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[2],
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.score).toEqual([
      new RankScore(rankAssignment.items[2], new Ratio(1)),
      new RankScore(rankAssignment.items[0], new Ratio(0.5)),
      new RankScore(rankAssignment.items[1], new Ratio(0)),
    ]);
  });

  it('should rank on multiple dimensions', () => {
    const user = new User('user 0');
    const rankDimension1 = new RankDimension(
      'importance',
      'low',
      'high',
      'ascending',
    );
    const rankDimension2 = new RankDimension(
      'urgency',
      'low',
      'high',
      'ascending',
    );
    let rankAssignment = new RankAssignment();
    rankAssignment = rankAssignment.addDimension(
      rankDimension1,
      rankDimension2,
    );
    rankAssignment = rankAssignment.addItems('item1', 'item2', 'item3');
    rankAssignment = rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[2],
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    rankAssignment = rankAssignment.rank(user, rankAssignment.dimensions[1], [
      rankAssignment.items[1],
      rankAssignment.items[0],
      rankAssignment.items[2],
    ]);
    expect(rankAssignment.score?.map((score) => score.score)).toEqual([
      new Ratio(0.5),
      new Ratio(0.5),
      new Ratio(0.5),
    ]);
  });

  it('should rank for multiple users', () => {
    const user1 = new User('user 0');
    const user2 = new User('user 1', '1');
    const rankDimension1 = new RankDimension(
      'importance',
      'low',
      'high',
      'ascending',
    );
    let rankAssignment = new RankAssignment();
    rankAssignment = rankAssignment.addDimension(rankDimension1);
    rankAssignment = rankAssignment.addItems('item1', 'item2');
    rankAssignment = rankAssignment.rank(user1, rankAssignment.dimensions[0], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    rankAssignment = rankAssignment.rank(user2, rankAssignment.dimensions[0], [
      rankAssignment.items[1],
      rankAssignment.items[0],
    ]);

    expect(rankAssignment.score?.map((score) => score.score)).toEqual([
      new Ratio(0.5),
      new Ratio(0.5),
    ]);
  });

  it('should rank supporting importance', () => {
    const user = new User('user 0');
    const rankDimension1 = new RankDimension(
      'importance',
      'low',
      'high',
      'ascending',
      new Ratio(1),
    );
    const rankDimension2 = new RankDimension(
      'urgency',
      'low',
      'high',
      'ascending',
      new Ratio(0.5),
    );
    let rankAssignment = new RankAssignment();
    rankAssignment = rankAssignment.addDimension(
      rankDimension1,
      rankDimension2,
    );
    rankAssignment = rankAssignment.addItems('item1', 'item2');
    rankAssignment = rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    rankAssignment = rankAssignment.rank(user, rankAssignment.dimensions[1], [
      rankAssignment.items[1],
      rankAssignment.items[0],
    ]);
    expect(rankAssignment.score).toEqual([
      new RankScore(rankAssignment.items[1], new Ratio(0.5)),
      new RankScore(rankAssignment.items[0], new Ratio(0.25)),
    ]);
  });

  it('should support adding items and dimensions', () => {
    const user = new User('user 0');
    const rankDimension1 = new RankDimension(
      'importance',
      'low',
      'high',
      'ascending',
      new Ratio(1),
      '0',
    );
    const rankDimension2 = new RankDimension(
      'urgency',
      'low',
      'high',
      'ascending',
      new Ratio(1),
      '0',
    );
    let rankAssignment = new RankAssignment();
    rankAssignment = rankAssignment.addDimension(
      rankDimension1,
      rankDimension2,
    );

    expect(rankAssignment.rankingComplete).toBe(false);
    expect(rankAssignment.score).toBeUndefined();
    rankAssignment = rankAssignment.rank(
      user,
      rankAssignment.dimensions[0],
      [],
    );
    rankAssignment = rankAssignment.rank(
      user,
      rankAssignment.dimensions[1],
      [],
    );
    expect(rankAssignment.rankingComplete).toBe(true);
    expect(rankAssignment.score).toHaveLength(0);
    rankAssignment = rankAssignment.addItems('item1', 'item2');
    expect(rankAssignment.rankingComplete).toBe(false);
    expect(rankAssignment.score).toBeUndefined();
    rankAssignment = rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.rankingComplete).toBe(false);
    rankAssignment = rankAssignment.rank(user, rankAssignment.dimensions[1], [
      rankAssignment.items[1],
      rankAssignment.items[0],
    ]);
    expect(rankAssignment.rankingComplete).toBe(true);
    expect(rankAssignment.score).toHaveLength(2);
    rankAssignment = rankAssignment.addDimension(
      new RankDimension(
        'complexity',
        'low',
        'high',
        'ascending',
        new Ratio(0.5),
      ),
    );
    expect(rankAssignment.rankingComplete).toBe(false);
    expect(rankAssignment.score).toBeUndefined();
    rankAssignment = rankAssignment.rank(user, rankAssignment.dimensions[2], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.rankingComplete).toBe(true);
  });

  it('should support incomplete rankings', () => {
    const user = new User('user 0');
    const rankDimension = new RankDimension(
      'importance',
      'low',
      'high',
      'ascending',
      new Ratio(1),
    );
    let rankAssignment = new RankAssignment();
    rankAssignment = rankAssignment.addDimension(rankDimension);
    rankAssignment = rankAssignment.addItems('item1', 'item2');
    rankAssignment = rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);

    expect(rankAssignment.score).toBeDefined();

    rankAssignment = rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[0],
    ]);

    // incomplete ranking ignored in the score
    expect(rankAssignment.score).toBeUndefined();
    // but the ranking is still stored
    expect(
      rankAssignment.rankingsByUser
        .get(user)
        ?.rankingByDimension(rankAssignment.dimensions[0]),
    ).toHaveLength(1);
  });

  it('should allow ranking a single item', () => {
    const user = new User('user', '0');
    const rankDimension = new RankDimension(
      'importance',
      'low',
      'high',
      'ascending',
      new Ratio(1),
    );
    let rankAssignment = new RankAssignment();
    rankAssignment = rankAssignment.addDimension(rankDimension);
    rankAssignment = rankAssignment.addItems('item1');
    rankAssignment = rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[0],
    ]);
    expect(rankAssignment.score).toEqual([
      new RankScore(rankAssignment.items[0], new Ratio(1)),
    ]);
  });
});
