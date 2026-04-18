import { RankDimension } from '@/core/RankDimension';
import { TestStore } from '@/core/TestStore';
import { User } from '@/core/User';

export function createCompleteRankingAssignment() {
  const user = User.make('~user 0');
  const rankDimension = RankDimension.make(
    'importance',
    'low',
    'high',
    'ascending',
  );
  const testStore = new TestStore();
  testStore.rankAssignment.addDimension(rankDimension);
  testStore.rankAssignment.addItems('item1', 'item2', 'item3');
  testStore.rankAssignment.rank(user, testStore.dimensions[0], [
    testStore.items[2],
    testStore.items[0],
    testStore.items[1],
  ]);
  return testStore;
}

export function createDimension() {
  return RankDimension.make('importance', 'low', 'high', 'descending');
}
