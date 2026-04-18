import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { User } from '@/core/User';
import { resetSharedStore, useSharedStore } from './store';

beforeEach(() => {
  resetSharedStore();
});

describe('useSharedStore', () => {
  it('starts empty', () => {
    const { doc } = useSharedStore.getState();
    expect(doc.items).toEqual([]);
    expect(doc.dimensions).toEqual([]);
    expect(doc.users).toEqual([]);
    expect(doc.rankingsByUser).toEqual({});
    expect(doc.dimensionWeights).toEqual({});
  });

  it('addItems appends items', () => {
    const a = Item.make('a');
    const b = Item.make('b');
    useSharedStore.getState().addItems(a, b);
    expect(useSharedStore.getState().doc.items).toEqual([a, b]);
  });

  it('removeItems removes by id', () => {
    const a = Item.make('a');
    const b = Item.make('b');
    useSharedStore.getState().addItems(a, b);
    useSharedStore.getState().removeItems(a);
    expect(useSharedStore.getState().doc.items).toEqual([b]);
  });

  it('addDimension appends dimensions', () => {
    const d = RankDimension.make('importance', 'low', 'high', 'ascending');
    useSharedStore.getState().addDimension(d);
    expect(useSharedStore.getState().doc.dimensions).toEqual([d]);
  });

  it('removeDimensions removes by id', () => {
    const d1 = RankDimension.make('a', 'lo', 'hi', 'ascending');
    const d2 = RankDimension.make('b', 'lo', 'hi', 'ascending');
    useSharedStore.getState().addDimension(d1, d2);
    useSharedStore.getState().removeDimensions(d1);
    expect(useSharedStore.getState().doc.dimensions).toEqual([d2]);
  });

  it('addUsers appends users', () => {
    const u = User.make('alice');
    useSharedStore.getState().addUsers(u);
    expect(useSharedStore.getState().doc.users).toEqual([u]);
  });

  it('setUserRanking stores item ids per user/dimension', () => {
    useSharedStore.getState().setUserRanking('u1', 'd1', ['i1', 'i2']);
    expect(useSharedStore.getState().doc.rankingsByUser).toEqual({
      u1: { d1: ['i1', 'i2'] },
    });
  });

  it('setUserRanking with undefined deletes the dimension entry', () => {
    useSharedStore.getState().setUserRanking('u1', 'd1', ['i1']);
    useSharedStore.getState().setUserRanking('u1', 'd1', undefined);
    expect(useSharedStore.getState().doc.rankingsByUser.u1).toEqual({});
  });

  it('setDimensionWeight stores weight', () => {
    useSharedStore.getState().setDimensionWeight('d1', 0.5);
    expect(useSharedStore.getState().doc.dimensionWeights).toEqual({ d1: 0.5 });
  });

  it('setDimensionWeight with undefined deletes the weight', () => {
    useSharedStore.getState().setDimensionWeight('d1', 0.5);
    useSharedStore.getState().setDimensionWeight('d1', undefined);
    expect(useSharedStore.getState().doc.dimensionWeights).toEqual({});
  });

  it('mutators advance the doc (each change produces a new reference)', () => {
    const initialDoc = useSharedStore.getState().doc;
    useSharedStore.getState().addItems(Item.make('a'));
    expect(useSharedStore.getState().doc).not.toBe(initialDoc);
  });
});
