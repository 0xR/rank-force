import { expect } from 'vitest';
import { deserializeJsonToYDoc, sync } from '../persistence/yjs-serialization';
import { Item } from './Item';
import { RankAssignment } from './RankAssignment';
import { RankDimension } from './RankDimension';
import { RankScore } from './RankScore';
import { Ratio } from './Ratio';
import { User } from './User';

function createRankAssigment() {
  const user = new User('user 0');
  let rankAssignment = new RankAssignment();
  rankAssignment = rankAssignment.addItems('item1', 'item2');
  rankAssignment = rankAssignment.addDimension(
    new RankDimension('importance', 'low', 'high', 'ascending', new Ratio(1)),
  );
  rankAssignment = rankAssignment.rank(user, rankAssignment.dimensions[0], [
    rankAssignment.items[0],
    rankAssignment.items[1],
  ]);
  return rankAssignment;
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
