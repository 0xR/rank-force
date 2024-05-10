import { RankAssignment } from '@/core/RankAssignment';
import { RankDimension } from '@/core/RankDimension';
import { Ratio } from '@/core/Ratio';
import { TestStore } from '@/core/TestStore';
import { User } from '@/core/User';

export function createCompleteRankingAssignment() {
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
  return { testStore, rankAssignment };
}

export function createDimension() {
  const rankDimension = new RankDimension(
    'importance',
    'low',
    'high',
    'ascending',
    new Ratio(1),
  );
  return rankDimension;
}
