import { describe, expect, it } from 'vitest';
import { Item } from './Item';
import { RankAssignment } from './RankAssignment';
import { RankDimension } from './RankDimension';
import { TestStore } from './TestStore';
import { User } from './User';

// Regression: a concurrent Automerge merge can leave the persisted state
// referentially inconsistent — `items`/`dimensions` lose an entry while a
// ranking or weight still references it. `items`/`dimensions` are
// authoritative; the read projection must drop dangling references rather than
// throw, so the session stays loadable for every participant.
describe('RankAssignment tolerates dangling references from a merge', () => {
  const user = User.make('alice');
  const dim = RankDimension.make('importance', 'low', 'high', 'descending');

  it('drops a ranking entry that references a removed item', () => {
    const kept = Item.make('kept');
    const removed = Item.make('removed'); // in the ranking, not in items

    const store = new TestStore(
      [kept],
      [dim],
      [user],
      { [user.id]: { [dim.id]: [kept.id, removed.id] } },
      { [dim.id]: 1 },
    );

    let assignment!: RankAssignment;
    expect(() => (assignment = new RankAssignment(store))).not.toThrow();

    const ranking = assignment.rankingsByUser
      .get(user)!
      .rankingByDimension(dim);
    expect(ranking.map((r) => r.item.id)).toEqual([kept.id]);
  });

  it('ignores a ranking keyed on a removed dimension', () => {
    const item = Item.make('item');
    const goneDimId = 'dimension-removed-by-peer';

    const store = new TestStore(
      [item],
      [dim],
      [user],
      { [user.id]: { [goneDimId]: [item.id] } },
      { [dim.id]: 1 },
    );

    expect(() => new RankAssignment(store)).not.toThrow();
  });

  it('ignores a weight for a removed dimension', () => {
    const item = Item.make('item');

    const store = new TestStore(
      [item],
      [dim],
      [user],
      {},
      { [dim.id]: 1, 'dimension-removed-by-peer': 0.5 },
    );

    expect(() => new RankAssignment(store)).not.toThrow();
  });
});
