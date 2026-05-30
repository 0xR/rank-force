import { describe, expect, it } from 'vitest';
import { Item } from './Item';
import { TestStore } from './TestStore';

describe('TestStore', () => {
  it('removeItems scrubs removed item ids from rankings', () => {
    const a = Item.make('a');
    const b = Item.make('b');
    const c = Item.make('c');
    const store = new TestStore([a, b, c], [], [], {
      u1: { d1: [a.id, b.id, c.id] },
    });

    store.removeItems(b);

    expect(store.items.map((i) => i.id)).toEqual([a.id, c.id]);
    expect(store.rankingsByUser.u1?.d1).toEqual([a.id, c.id]);
  });
});
