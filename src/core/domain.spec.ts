import 'reflect-metadata';
import { stateFromPlainObject } from '@/app/session/[sessionId]/store';
import { expect } from 'vitest';
import { Item } from './Item';
import {
  RankAssignment,
  State,
  stateToPlainObject,
  Store,
} from './RankAssignment';
import { RankDimension } from './RankDimension';
import { RankScore } from './RankScore';
import { Ratio } from './Ratio';
import { User } from './User';

class TestStore implements Store {
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
    const testStore = new TestStore();
    let rankAssignment = new RankAssignment(testStore);
    rankAssignment.addDimension(rankDimension);
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.addItems('item1', 'item2', 'item3');
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.rank(user, testStore.dimensions[0], [
      testStore.items[2],
      testStore.items[0],
      testStore.items[1],
    ]);
    rankAssignment = testStore.toRankAssignment();
    expect(rankAssignment.score).toEqual([
      new RankScore(testStore.items[1], new Ratio(1)),
      new RankScore(testStore.items[0], new Ratio(0.5)),
      new RankScore(testStore.items[2], new Ratio(0)),
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
    const testStore = new TestStore();
    let rankAssignment = new RankAssignment(testStore);
    rankAssignment.addDimension(rankDimension);
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.addItems('item1', 'item2', 'item3');
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.rank(user, testStore.dimensions[0], [
      testStore.items[2],
      testStore.items[0],
      testStore.items[1],
    ]);
    rankAssignment = testStore.toRankAssignment();
    expect(rankAssignment.score).toEqual([
      new RankScore(testStore.items[2], new Ratio(1)),
      new RankScore(testStore.items[0], new Ratio(0.5)),
      new RankScore(testStore.items[1], new Ratio(0)),
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
    const testStore = new TestStore();
    let rankAssignment = new RankAssignment(testStore);
    rankAssignment.addDimension(rankDimension1, rankDimension2);
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.addItems('item1', 'item2', 'item3');
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.rank(user, testStore.dimensions[0], [
      testStore.items[2],
      testStore.items[0],
      testStore.items[1],
    ]);
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.rank(user, testStore.dimensions[1], [
      testStore.items[1],
      testStore.items[0],
      testStore.items[2],
    ]);
    rankAssignment = testStore.toRankAssignment();
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
    const testStore = new TestStore();
    let rankAssignment = new RankAssignment(testStore);
    rankAssignment.addDimension(rankDimension1);
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.addItems('item1', 'item2');
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.rank(user1, testStore.dimensions[0], [
      testStore.items[0],
      testStore.items[1],
    ]);
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.rank(user2, testStore.dimensions[0], [
      testStore.items[1],
      testStore.items[0],
    ]);
    rankAssignment = testStore.toRankAssignment();

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
    const testStore = new TestStore();
    let rankAssignment = new RankAssignment(testStore);
    rankAssignment.addDimension(rankDimension1, rankDimension2);
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.addItems('item1', 'item2');
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.rank(user, testStore.dimensions[0], [
      testStore.items[0],
      testStore.items[1],
    ]);
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.rank(user, testStore.dimensions[1], [
      testStore.items[1],
      testStore.items[0],
    ]);
    rankAssignment = testStore.toRankAssignment();
    expect(rankAssignment.score).toEqual([
      new RankScore(testStore.items[1], new Ratio(0.5)),
      new RankScore(testStore.items[0], new Ratio(0.25)),
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
      '1',
    );
    const testStore = new TestStore();
    let rankAssignment = new RankAssignment(testStore);
    rankAssignment.addDimension(rankDimension1, rankDimension2);
    rankAssignment = testStore.toRankAssignment();

    expect(rankAssignment.rankingComplete).toBe(false);
    expect(rankAssignment.score).toBeUndefined();
    rankAssignment.rank(user, testStore.dimensions[0], []);
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.rank(user, testStore.dimensions[1], []);
    rankAssignment = testStore.toRankAssignment();
    expect(rankAssignment.rankingComplete).toBe(true);
    expect(rankAssignment.score).toHaveLength(0);
    rankAssignment.addItems('item1', 'item2');
    rankAssignment = testStore.toRankAssignment();
    expect(rankAssignment.rankingComplete).toBe(false);
    expect(rankAssignment.score).toBeUndefined();
    rankAssignment.rank(user, testStore.dimensions[0], [
      testStore.items[0],
      testStore.items[1],
    ]);
    rankAssignment = testStore.toRankAssignment();
    expect(rankAssignment.rankingComplete).toBe(false);
    rankAssignment.rank(user, testStore.dimensions[1], [
      testStore.items[1],
      testStore.items[0],
    ]);
    rankAssignment = testStore.toRankAssignment();
    expect(rankAssignment.rankingComplete).toBe(true);
    expect(rankAssignment.score).toHaveLength(2);
    rankAssignment.addDimension(
      new RankDimension(
        'complexity',
        'low',
        'high',
        'ascending',
        new Ratio(0.5),
      ),
    );
    rankAssignment = testStore.toRankAssignment();
    expect(rankAssignment.rankingComplete).toBe(false);
    expect(rankAssignment.score).toBeUndefined();
    rankAssignment.rank(user, testStore.dimensions[2], [
      testStore.items[0],
      testStore.items[1],
    ]);
    rankAssignment = testStore.toRankAssignment();
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
    const testStore = new TestStore();
    let rankAssignment = new RankAssignment(testStore);
    rankAssignment.addDimension(rankDimension);
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.addItems('item1', 'item2');
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.rank(user, testStore.dimensions[0], [
      testStore.items[0],
      testStore.items[1],
    ]);
    rankAssignment = testStore.toRankAssignment();

    expect(rankAssignment.score).toBeDefined();

    rankAssignment.rank(user, testStore.dimensions[0], [testStore.items[0]]);
    rankAssignment = testStore.toRankAssignment();

    // incomplete ranking ignored in the score
    expect(rankAssignment.score).toBeUndefined();
    // but the ranking is still stored
    expect(
      testStore.rankingsByUser[user.id]?.[testStore.dimensions[0].id],
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
    const testStore = new TestStore();
    let rankAssignment = new RankAssignment(testStore);
    rankAssignment.addDimension(rankDimension);
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.addItems('item1');
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.rank(user, testStore.dimensions[0], [testStore.items[0]]);
    rankAssignment = testStore.toRankAssignment();
    expect(rankAssignment.score).toEqual([
      new RankScore(testStore.items[0], new Ratio(1)),
    ]);
  });

  it('should serialize and deserialize from teststore', () => {
    const user = new User('user 0');
    const rankDimension = new RankDimension(
      'importance',
      'low',
      'high',
      'ascending',
      new Ratio(1),
    );
    const testStore = new TestStore();
    let rankAssignment = new RankAssignment(testStore);
    rankAssignment.addDimension(rankDimension);
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.addItems('item1', 'item2', 'item3');
    rankAssignment = testStore.toRankAssignment();
    rankAssignment.rank(user, testStore.dimensions[0], [
      testStore.items[2],
      testStore.items[0],
      testStore.items[1],
    ]);

    rankAssignment.rank(user, testStore.dimensions[0], [
      testStore.items[2],
      testStore.items[0],
      testStore.items[1],
    ]);

    rankAssignment = testStore.toRankAssignment();

    const plain = stateToPlainObject(testStore);
    const serialized = JSON.stringify(plain, null, 2);
    const deserialized = JSON.parse(serialized);

    const testStore2 = TestStore.fromState(stateFromPlainObject(deserialized));
    const rankAssignment2 = new RankAssignment(testStore2);
    expect(rankAssignment).toEqual(rankAssignment2);
  });
});
