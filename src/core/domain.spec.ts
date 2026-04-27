import { buildState } from '@/core/mock-factories';
import { TestStore } from '@/core/TestStore';
import { expect } from 'vitest';
import { RankAssignment } from './RankAssignment';
import { RankDimension } from './RankDimension';
import { RankScore } from './RankScore';
import { Ratio } from './Ratio';
import { Store } from './State';
import { User } from './User';

function makeSnapshotStore(initial?: {
  dimensions?: RankDimension[];
  dimensionWeights?: Record<string, number>;
}): { store: Store; applied: Record<string, number> } {
  const dimensions: RankDimension[] = [...(initial?.dimensions ?? [])];
  const dimensionWeights: Record<string, number> = {
    ...(initial?.dimensionWeights ?? {}),
  };
  const applied: Record<string, number> = { ...dimensionWeights };
  const store: Store = {
    items: [],
    dimensions,
    users: [],
    rankingsByUser: {},
    dimensionWeights,
    addItems: () => {},
    addUsers: () => {},
    removeUsers: () => {},
    removeItems: () => {},
    removeDimensions: () => {},
    setUserRanking: () => {},
    addDimension: () => {},
    setDimensionWeight: (id, weight) => {
      if (weight === undefined) delete applied[id];
      else applied[id] = weight;
    },
  };
  return { store, applied };
}

const createDimension = () =>
  RankDimension.make('importance', 'low', 'high', 'descending');

describe('Domain', () => {
  it('should rank on a single dimension', () => {
    const user = User.make('~user 0');
    const rankDimension = RankDimension.make(
      'importance',
      'low',
      'high',
      'descending',
    );
    const testStore = new TestStore();
    testStore.rankAssignment.addDimension(rankDimension);
    testStore.rankAssignment.addItems('item1', 'item2', 'item3');
    testStore.rankAssignment.rank(user, testStore.dimensions[0]!, [
      testStore.items[2]!,
      testStore.items[0]!,
      testStore.items[1]!,
    ]);
    expect(testStore.rankAssignment.score).toEqual([
      new RankScore(testStore.items[1]!, new Ratio(1)),
      new RankScore(testStore.items[0]!, new Ratio(0.5)),
      new RankScore(testStore.items[2]!, new Ratio(0)),
    ]);
  });

  it('should rank on a single descending dimension', () => {
    const user = User.make('~user 0');
    const rankDimension = RankDimension.make(
      'importance',
      'high',
      'low',
      'ascending',
    );
    const testStore = new TestStore();
    testStore.rankAssignment.addDimension(rankDimension);
    testStore.rankAssignment.addItems('item1', 'item2', 'item3');
    testStore.rankAssignment.rank(user, testStore.dimensions[0]!, [
      testStore.items[2]!,
      testStore.items[0]!,
      testStore.items[1]!,
    ]);
    expect(testStore.rankAssignment.score).toEqual([
      new RankScore(testStore.items[2]!, new Ratio(1)),
      new RankScore(testStore.items[0]!, new Ratio(0.5)),
      new RankScore(testStore.items[1]!, new Ratio(0)),
    ]);
  });

  it('should rank on multiple dimensions', () => {
    const user = User.make('~user 0');
    const rankDimension1 = RankDimension.make(
      'importance',
      'low',
      'high',
      'ascending',
    );
    const rankDimension2 = RankDimension.make(
      'urgency',
      'low',
      'high',
      'ascending',
    );
    const testStore = new TestStore();
    testStore.rankAssignment.addDimension(rankDimension1, rankDimension2);
    testStore.rankAssignment.addItems('item1', 'item2', 'item3');
    testStore.rankAssignment.rank(user, testStore.dimensions[0]!, [
      testStore.items[2]!,
      testStore.items[0]!,
      testStore.items[1]!,
    ]);
    testStore.rankAssignment.rank(user, testStore.dimensions[1]!, [
      testStore.items[1]!,
      testStore.items[0]!,
      testStore.items[2]!,
    ]);
    expect(testStore.rankAssignment.score?.map((score) => score.score)).toEqual(
      [new Ratio(0.5), new Ratio(0.5), new Ratio(0.5)],
    );
  });

  it('should consider dimension weight', () => {
    const user = User.make('~user 0');
    const rankDimension1 = RankDimension.make(
      'importance',
      'low',
      'high',
      'ascending',
    );
    const rankDimension2 = RankDimension.make(
      'urgency',
      'low',
      'high',
      'ascending',
    );
    const testStore = new TestStore();
    testStore.rankAssignment.addDimension(rankDimension1, rankDimension2);
    testStore.rankAssignment.addItems('item1', 'item2', 'item3');
    testStore.rankAssignment.rank(user, testStore.dimensions[0]!, [
      testStore.items[2]!,
      testStore.items[0]!,
      testStore.items[1]!,
    ]);
    testStore.rankAssignment.rank(user, testStore.dimensions[1]!, [
      testStore.items[1]!,
      testStore.items[0]!,
      testStore.items[2]!,
    ]);

    testStore.rankAssignment.setDimensionWeight(
      testStore.dimensions[0]!,
      new Ratio(1),
    );

    expect(testStore.rankAssignment.score).toEqual([
      new RankScore(testStore.items[2]!, new Ratio(1)),
      new RankScore(testStore.items[0]!, new Ratio(0.5)),
      new RankScore(testStore.items[1]!, new Ratio(0)),
    ]);
  });

  it('should give a dimension a weight', () => {
    const rankDimension1 = RankDimension.make(
      'importance',
      'low',
      'high',
      'ascending',
    );
    const testStore = new TestStore();
    testStore.rankAssignment.addDimension(rankDimension1);

    expect(
      testStore.rankAssignment.dimensionWeight.get(rankDimension1),
    ).toEqual(new Ratio(1));
  });

  it('should divide the weight of dimensions', () => {
    const rankDimension1 = createDimension();
    const rankDimension2 = createDimension();
    const testStore = new TestStore();
    testStore.rankAssignment.addDimension(rankDimension1);
    testStore.rankAssignment.addDimension(rankDimension2);

    expect(
      testStore.rankAssignment.dimensionWeight.get(rankDimension1),
    ).toEqual(new Ratio(0.5));
    expect(
      testStore.rankAssignment.dimensionWeight.get(rankDimension2),
    ).toEqual(new Ratio(0.5));

    testStore.rankAssignment.setDimensionWeight(rankDimension1, new Ratio(0.8));

    expect(
      testStore.rankAssignment.dimensionWeight.get(rankDimension1),
    ).toEqual(new Ratio(0.8));
    expect(
      testStore.rankAssignment.dimensionWeight
        .get(rankDimension2)
        ?.equals(new Ratio(0.2)),
    ).toBe(true);
  });

  it('should divide the weight of dimensions when adding', () => {
    const rankDimension1 = createDimension();
    const rankDimension2 = createDimension();
    const rankDimension3 = createDimension();
    const rankDimension4 = createDimension();
    const testStore = new TestStore();
    testStore.rankAssignment.addDimension(rankDimension1);

    expect(
      testStore.rankAssignment.dimensionWeight
        .get(rankDimension1)
        ?.equals(new Ratio(1)),
    ).toBe(true);

    testStore.rankAssignment.addDimension(rankDimension2);

    for (const dimension of [rankDimension1, rankDimension2]) {
      expect(
        testStore.rankAssignment.dimensionWeight
          .get(dimension)
          ?.equals(new Ratio(0.5)),
      ).toBe(true);
    }

    testStore.rankAssignment.addDimension(rankDimension3);

    for (const dimension of [rankDimension1, rankDimension2, rankDimension3]) {
      expect(
        testStore.rankAssignment.dimensionWeight
          .get(dimension)
          ?.equals(new Ratio(1 / 3)),
      ).toBe(true);
    }

    testStore.rankAssignment.addDimension(rankDimension4);

    for (const dimension of [
      rankDimension1,
      rankDimension2,
      rankDimension3,
      rankDimension4,
    ]) {
      expect(
        testStore.rankAssignment.dimensionWeight
          .get(dimension)
          ?.equals(new Ratio(0.25)),
      ).toBe(true);
    }
  });

  it('should rank for multiple users', () => {
    const user1 = User.make('~user 0');
    const user2 = User.make('~user 1', '1');
    const rankDimension1 = RankDimension.make(
      'importance',
      'low',
      'high',
      'ascending',
    );
    const testStore = new TestStore();
    testStore.rankAssignment.addDimension(rankDimension1);
    testStore.rankAssignment.addItems('item1', 'item2');
    testStore.rankAssignment.rank(user1, testStore.dimensions[0]!, [
      testStore.items[0]!,
      testStore.items[1]!,
    ]);
    testStore.rankAssignment.rank(user2, testStore.dimensions[0]!, [
      testStore.items[1]!,
      testStore.items[0]!,
    ]);

    expect(testStore.rankAssignment.score?.map((score) => score.score)).toEqual(
      [new Ratio(0.5), new Ratio(0.5)],
    );
  });

  it('should support adding items and dimensions', () => {
    const user = User.make('~user 0');
    const rankDimension1 = RankDimension.make(
      'importance',
      'low',
      'high',
      'ascending',
      '0',
    );
    const rankDimension2 = RankDimension.make(
      'urgency',
      'low',
      'high',
      'ascending',
      '1',
    );
    const testStore = new TestStore();
    testStore.rankAssignment.addDimension(rankDimension1, rankDimension2);

    expect(testStore.rankAssignment.rankingComplete).toBe(false);
    expect(testStore.rankAssignment.score).toBeUndefined();
    testStore.rankAssignment.rank(user, testStore.dimensions[0]!, []);
    testStore.rankAssignment.rank(user, testStore.dimensions[1]!, []);
    expect(testStore.rankAssignment.rankingComplete).toBe(true);
    expect(testStore.rankAssignment.score).toHaveLength(0);
    testStore.rankAssignment.addItems('item1', 'item2');
    expect(testStore.rankAssignment.rankingComplete).toBe(false);
    expect(testStore.rankAssignment.score).toBeUndefined();
    testStore.rankAssignment.rank(user, testStore.dimensions[0]!, [
      testStore.items[0]!,
      testStore.items[1]!,
    ]);
    expect(testStore.rankAssignment.rankingComplete).toBe(false);
    testStore.rankAssignment.rank(user, testStore.dimensions[1]!, [
      testStore.items[1]!,
      testStore.items[0]!,
    ]);
    expect(testStore.rankAssignment.rankingComplete).toBe(true);
    expect(testStore.rankAssignment.score).toHaveLength(2);
    testStore.rankAssignment.addDimension(
      RankDimension.make('complexity', 'low', 'high', 'ascending'),
    );
    expect(testStore.rankAssignment.rankingComplete).toBe(false);
    expect(testStore.rankAssignment.score).toBeUndefined();
    testStore.rankAssignment.rank(user, testStore.dimensions[2]!, [
      testStore.items[0]!,
      testStore.items[1]!,
    ]);
    expect(testStore.rankAssignment.rankingComplete).toBe(true);
  });

  it('should support incomplete rankings', () => {
    const user = User.make('~user 0');
    const rankDimension = RankDimension.make(
      'importance',
      'low',
      'high',
      'ascending',
    );
    const testStore = new TestStore();
    testStore.rankAssignment.addDimension(rankDimension);
    testStore.rankAssignment.addItems('item1', 'item2');
    testStore.rankAssignment.rank(user, testStore.dimensions[0]!, [
      testStore.items[0]!,
      testStore.items[1]!,
    ]);

    expect(testStore.rankAssignment.score).toBeDefined();

    testStore.rankAssignment.rank(user, testStore.dimensions[0]!, [
      testStore.items[0]!,
    ]);

    // incomplete ranking ignored in the score
    expect(testStore.rankAssignment.score).toBeUndefined();
    // but the ranking is still stored
    expect(
      testStore.rankingsByUser[user.id]?.[testStore.dimensions[0]!.id],
    ).toHaveLength(1);
  });

  it('should allow ranking a single item', () => {
    const user = User.make('user', '0');
    const rankDimension = RankDimension.make(
      'importance',
      'low',
      'high',
      'descending',
    );
    const testStore = new TestStore();
    testStore.rankAssignment.addDimension(rankDimension);
    testStore.rankAssignment.addItems('item1');
    testStore.rankAssignment.rank(user, testStore.dimensions[0]!, [
      testStore.items[0]!,
    ]);
    expect(testStore.rankAssignment.score).toEqual([
      new RankScore(testStore.items[0]!, new Ratio(1)),
    ]);
  });

  it('should allow removing an item that is ranked', () => {
    const user = User.make('user', '0');
    const rankDimension = createDimension();
    const testStore = new TestStore();
    testStore.rankAssignment.addDimension(rankDimension);

    testStore.rankAssignment.addItems('item1');
    testStore.rankAssignment.addItems('item2');

    testStore.rankAssignment.rank(user, testStore.dimensions[0]!, [
      testStore.items[0]!,
      testStore.items[1]!,
    ]);

    testStore.rankAssignment.removeItems(testStore.rankAssignment.items[0]!);

    expect(testStore.rankAssignment.score).toHaveLength(1);
  });

  it('should allow removing a dimension is ranked', () => {
    const user = User.make('user', '0');
    const rankDimension = createDimension();
    const testStore = new TestStore();
    testStore.rankAssignment.addDimension(rankDimension);

    testStore.rankAssignment.addItems('item1');
    testStore.rankAssignment.addItems('item2');

    testStore.rankAssignment.rank(user, testStore.dimensions[0]!, [
      testStore.items[0]!,
      testStore.items[1]!,
    ]);

    testStore.rankAssignment.removeDimensions(rankDimension);

    expect(testStore.rankAssignment.score).toHaveLength(2);
  });

  it('should produce non-NaN scores for a fully-ranked buildState', () => {
    const testStore = TestStore.fromState(
      buildState({ users: 3, items: 4, dimensions: 2, ranked: true }),
    );

    const scores = testStore.rankAssignment.score;
    expect(scores).toBeDefined();
    expect(scores!.every((s) => Number.isFinite(s.score.value))).toBe(true);
    expect(scores!.every((s) => s.score.label !== 'NaN%')).toBe(true);
  });

  it('should serialize and deserialize from teststore', () => {
    const testStore = TestStore.fromState(
      buildState({ users: 2, items: 3, dimensions: 2, ranked: true }),
    );

    const plain = testStore.toPlainObject();
    const serialized = JSON.stringify(plain, null, 2);
    const deserialized = JSON.parse(serialized);

    const testStore2 = TestStore.fromState(deserialized);
    expect(testStore.rankAssignment).toEqual(testStore2.rankAssignment);
  });

  it('addDimension batch yields equal weights against a snapshot-read store', () => {
    const { store, applied } = makeSnapshotStore();
    const assignment = new RankAssignment(store);

    const a = RankDimension.make('Urgency', 'low', 'high', 'ascending');
    const b = RankDimension.make('Importance', 'low', 'high', 'ascending');
    assignment.addDimension(a, b);

    expect(applied[a.id]).toBeCloseTo(0.5, 8);
    expect(applied[b.id]).toBeCloseTo(0.5, 8);
  });

  it('addDimension preserves existing weight proportions when extending', () => {
    const existing = RankDimension.make('Speed', 'slow', 'fast', 'ascending');
    const { store, applied } = makeSnapshotStore({
      dimensions: [existing],
      dimensionWeights: { [existing.id]: 1 },
    });
    const assignment = new RankAssignment(store);

    const fresh = RankDimension.make('Cost', 'low', 'high', 'descending');
    assignment.addDimension(fresh);

    expect(applied[existing.id]).toBeCloseTo(0.5, 8);
    expect(applied[fresh.id]).toBeCloseTo(0.5, 8);
  });
});
