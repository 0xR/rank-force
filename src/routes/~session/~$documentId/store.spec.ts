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

  it('replaceItems sets items to the provided list in order', () => {
    const d = emptyState();
    const a = Item.make('a');
    const b = Item.make('b');
    draftMutators.addItems(d, [a, b]);
    draftMutators.replaceItems(d, [b, a]);
    expect(d.items.map((i) => i.id)).toEqual([b.id, a.id]);
  });

  it('replaceItems with an empty list clears items', () => {
    const d = emptyState();
    draftMutators.addItems(d, [Item.make('a'), Item.make('b')]);
    draftMutators.replaceItems(d, []);
    expect(d.items).toEqual([]);
  });

  it('replaceItems scrubs removed item ids from rankings', () => {
    const d = emptyState();
    const a = Item.make('a');
    const b = Item.make('b');
    const c = Item.make('c');
    draftMutators.addItems(d, [a, b, c]);
    draftMutators.setUserRanking(d, 'u1', 'd1', [a.id, b.id, c.id]);
    draftMutators.replaceItems(d, [a, c]);
    expect(d.items.map((i) => i.id)).toEqual([a.id, c.id]);
    expect(d.rankingsByUser.u1?.d1).toEqual([a.id, c.id]);
  });

  it('replaceItems leaves rankings untouched when nothing was removed', () => {
    const d = emptyState();
    const a = Item.make('a');
    const b = Item.make('b');
    draftMutators.addItems(d, [a, b]);
    draftMutators.setUserRanking(d, 'u1', 'd1', [a.id, b.id]);
    draftMutators.replaceItems(d, [b, a]);
    expect(d.rankingsByUser.u1?.d1).toEqual([a.id, b.id]);
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

  it('editDimension replaces a dimension by id, preserving position', () => {
    const d = emptyState();
    const a = RankDimension.make('a', 'lo', 'hi', 'ascending');
    const b = RankDimension.make('b', 'lo', 'hi', 'ascending');
    draftMutators.addDimension(d, [a, b]);
    const renamed = RankDimension.make(
      'b prime',
      'low',
      'high',
      'descending',
      b.id,
    );
    draftMutators.editDimension(d, renamed);
    expect(d.dimensions[0]).toEqual(a);
    expect(d.dimensions[1]).toEqual(renamed);
  });

  it('editDimension throws when the id is unknown', () => {
    const d = emptyState();
    const ghost = RankDimension.make('ghost', 'lo', 'hi', 'ascending');
    expect(() => draftMutators.editDimension(d, ghost)).toThrow();
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
