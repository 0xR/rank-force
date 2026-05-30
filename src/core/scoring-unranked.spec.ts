import { describe, expect, it } from 'vitest';
import { RankDimension } from './RankDimension';
import { TestStore } from './TestStore';
import { User } from './User';

// "Unranked = lowest": an item a participant leaves in the unranked pool counts
// as their worst, so it can't reach 100% unless every participant ranks it high.
describe('scoring: unranked counts as lowest', () => {
  it('drops an item below 100% when a participant did not rank it', () => {
    const ruben = User.make('ruben');
    const piet = User.make('piet');
    const dim = RankDimension.make('importance', 'low', 'high', 'ascending');
    const store = new TestStore();
    store.rankAssignment.addDimension(dim);
    store.rankAssignment.addItems('e', 'a', 'b', 'c', 'd'); // M = 5
    const [e, a, b, c, d] = store.items;

    // Ruben ranks all five, einaudi (e) first → e = 100% for Ruben.
    store.rankAssignment.rank(ruben, store.dimensions[0]!, [
      e!,
      a!,
      b!,
      c!,
      d!,
    ]);
    // Piet ranks only a, b, c; leaves e and d unranked (bottom-share = 12.5%).
    store.rankAssignment.rank(piet, store.dimensions[0]!, [a!, b!, c!]);

    const score = store.rankAssignment.score;
    const byId = new Map(score.map((s) => [s.item.id, s.score.value]));

    // e = mean(100%, 12.5%) = 56.25% — below 100% and no longer the winner.
    expect(byId.get(e!.id)).toBeCloseTo(0.5625, 8);
    expect(score[0]!.item.id).not.toBe(e!.id);
  });

  it('shares the bottom score (12.5%) equally across unranked items', () => {
    const u1 = User.make('u1');
    const u2 = User.make('u2');
    const u3 = User.make('u3');
    const dim = RankDimension.make('importance', 'low', 'high', 'ascending');
    const store = new TestStore();
    store.rankAssignment.addDimension(dim);
    store.rankAssignment.addItems('a', 'b', 'c', 't', 'd'); // M = 5
    const [a, b, c, t, d] = store.items;

    // u1 ranks all five (so t,d are visible). u2 and u3 rank only a,b,c and
    // leave t,d unranked → each contributes mean(25%, 0%) = 12.5% to both.
    store.rankAssignment.rank(u1, store.dimensions[0]!, [a!, b!, c!, t!, d!]);
    store.rankAssignment.rank(u2, store.dimensions[0]!, [a!, b!, c!]);
    store.rankAssignment.rank(u3, store.dimensions[0]!, [a!, b!, c!]);

    const byId = new Map(
      store.rankAssignment.score.map((s) => [s.item.id, s.score.value]),
    );
    // t = mean(25%, 12.5%, 12.5%) = 16.67%; d = mean(0%, 12.5%, 12.5%) = 8.33%.
    // The 12.5% shares are identical, so t and d differ only by u1's ranking.
    expect(byId.get(t!.id)).toBeCloseTo(0.5 / 3, 8);
    expect(byId.get(d!.id)).toBeCloseTo(0.25 / 3, 8);
    expect(byId.get(a!.id)).toBeCloseTo(1, 8);
  });

  it('sinks unranked items to the bottom under a descending dimension', () => {
    const u1 = User.make('u1');
    const u2 = User.make('u2');
    const dim = RankDimension.make('importance', 'high', 'low', 'descending');
    const store = new TestStore();
    store.rankAssignment.addDimension(dim);
    store.rankAssignment.addItems('a', 'b', 'c'); // M = 3
    const [a, b, c] = store.items;

    // Descending: last-dragged is best. u2 ranks all; u1 leaves a unranked.
    store.rankAssignment.rank(u2, store.dimensions[0]!, [a!, b!, c!]);
    store.rankAssignment.rank(u1, store.dimensions[0]!, [b!, c!]);

    const score = store.rankAssignment.score;
    const byId = new Map(score.map((s) => [s.item.id, s.score.value]));
    expect(byId.get(c!.id)).toBeCloseTo(1, 8); // last-dragged = winner
    expect(byId.get(b!.id)).toBeCloseTo(0.5, 8);
    expect(byId.get(a!.id)).toBeCloseTo(0, 8); // unranked sinks to the bottom
  });

  it('excludes a participant from a dimension they have not ranked', () => {
    const u1 = User.make('u1');
    const u2 = User.make('u2');
    const d1 = RankDimension.make('a', 'low', 'high', 'ascending');
    const d2 = RankDimension.make('b', 'low', 'high', 'ascending');
    const store = new TestStore();
    store.rankAssignment.addDimension(d1, d2);
    store.rankAssignment.addItems('p', 'q'); // M = 2
    const [p, q] = store.items;

    // u1 only touches d1, u2 only touches d2. Neither should pin the other
    // dimension's items to the bottom — they are simply excluded there.
    store.rankAssignment.rank(u1, store.dimensions[0]!, [p!, q!]);
    store.rankAssignment.rank(u2, store.dimensions[1]!, [q!, p!]);

    const byId = new Map(
      store.rankAssignment.score.map((s) => [s.item.id, s.score.value]),
    );
    // d1: p=1,q=0 (u1 only); d2: q=1,p=0 (u2 only); equal weights → both 0.5.
    expect(byId.get(p!.id)).toBeCloseTo(0.5, 8);
    expect(byId.get(q!.id)).toBeCloseTo(0.5, 8);
  });
});
