import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { State } from '@/core/State';
import { User } from '@/core/User';
import { draftMutators } from './store';

function emptyState(): State {
  return {
    items: [],
    dimensions: [],
    users: [],
    rankingsByUser: {},
    dimensionWeights: {},
  };
}

describe('draftMutators', () => {
  it('addItems appends items', () => {
    const d = emptyState();
    const a = Item.make('a');
    const b = Item.make('b');
    draftMutators.addItems(d, [a, b]);
    expect(d.items).toEqual([a, b]);
  });

  it('removeItems removes by id', () => {
    const d = emptyState();
    const a = Item.make('a');
    const b = Item.make('b');
    draftMutators.addItems(d, [a, b]);
    draftMutators.removeItems(d, [a]);
    expect(d.items).toEqual([b]);
  });

  it('addDimension appends dimensions', () => {
    const d = emptyState();
    const dim = RankDimension.make('importance', 'low', 'high', 'ascending');
    draftMutators.addDimension(d, [dim]);
    expect(d.dimensions).toEqual([dim]);
  });

  it('removeDimensions removes by id', () => {
    const d = emptyState();
    const d1 = RankDimension.make('a', 'lo', 'hi', 'ascending');
    const d2 = RankDimension.make('b', 'lo', 'hi', 'ascending');
    draftMutators.addDimension(d, [d1, d2]);
    draftMutators.removeDimensions(d, [d1]);
    expect(d.dimensions).toEqual([d2]);
  });

  it('addUsers appends users', () => {
    const d = emptyState();
    const u = User.make('alice');
    draftMutators.addUsers(d, [u]);
    expect(d.users).toEqual([u]);
  });

  it('removeUsers removes by id', () => {
    const d = emptyState();
    const a = User.make('alice');
    const b = User.make('bob');
    draftMutators.addUsers(d, [a, b]);
    draftMutators.removeUsers(d, [a]);
    expect(d.users).toEqual([b]);
  });

  it('removeUsers also clears the user’s rankings', () => {
    const d = emptyState();
    const a = User.make('alice');
    draftMutators.addUsers(d, [a]);
    draftMutators.setUserRanking(d, a.id, 'd1', ['i1']);
    draftMutators.removeUsers(d, [a]);
    expect(d.rankingsByUser[a.id]).toBeUndefined();
  });

  it('removeUsers is a no-op for an unknown user', () => {
    const d = emptyState();
    const a = User.make('alice');
    draftMutators.addUsers(d, [a]);
    const ghost = User.make('ghost');
    draftMutators.removeUsers(d, [ghost]);
    expect(d.users).toEqual([a]);
  });

  it('removeUsers accepts multiple users at once', () => {
    const d = emptyState();
    const a = User.make('alice');
    const b = User.make('bob');
    const c = User.make('carol');
    draftMutators.addUsers(d, [a, b, c]);
    draftMutators.removeUsers(d, [a, c]);
    expect(d.users).toEqual([b]);
  });

  it('setUserRanking stores item ids per user/dimension', () => {
    const d = emptyState();
    draftMutators.setUserRanking(d, 'u1', 'd1', ['i1', 'i2']);
    expect(d.rankingsByUser).toEqual({ u1: { d1: ['i1', 'i2'] } });
  });

  it('setUserRanking with undefined deletes the dimension entry', () => {
    const d = emptyState();
    draftMutators.setUserRanking(d, 'u1', 'd1', ['i1']);
    draftMutators.setUserRanking(d, 'u1', 'd1', undefined);
    expect(d.rankingsByUser.u1).toEqual({});
  });

  it('setDimensionWeight stores weight', () => {
    const d = emptyState();
    draftMutators.setDimensionWeight(d, 'd1', 0.5);
    expect(d.dimensionWeights).toEqual({ d1: 0.5 });
  });

  it('setDimensionWeight with undefined deletes the weight', () => {
    const d = emptyState();
    draftMutators.setDimensionWeight(d, 'd1', 0.5);
    draftMutators.setDimensionWeight(d, 'd1', undefined);
    expect(d.dimensionWeights).toEqual({});
  });
});
