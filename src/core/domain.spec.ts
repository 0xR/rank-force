import { expect } from 'vitest';
import { deserializeJsonToYDoc } from '../persistence/yjs-serialization.ts';
import { Item } from './Item.ts';
import { RankAssignment } from './RankAssignment.ts';
import { RankDimension } from './RankDimension.ts';
import { RankScore } from './RankScore.ts';
import { Ratio } from './Ratio.ts';
import { User } from './User.ts';

describe('Domain', () => {
  it('should rank on a single dimension', () => {
    const user = new User('0', 'user 0');
    const rankDimension = new RankDimension(
      '0',
      'importance',
      'low',
      'high',
      'ascending',
    );
    const rankAssignment = new RankAssignment();
    rankAssignment.addDimension(rankDimension);
    rankAssignment.addItems(['item1', 'item2', 'item3']);
    rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[2],
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.score).toEqual([
      new RankScore(new Item(1, 'item2'), new Ratio(1)),
      new RankScore(new Item(0, 'item1'), new Ratio(0.5)),
      new RankScore(new Item(2, 'item3'), new Ratio(0)),
    ]);
  });

  it('should rank on a single descending dimension', () => {
    const user = new User('0', 'user 0');
    const rankDimension = new RankDimension(
      '0',
      'importance',
      'high',
      'low',
      'descending',
    );
    const rankAssignment = new RankAssignment();
    rankAssignment.addDimension(rankDimension);
    rankAssignment.addItems(['item1', 'item2', 'item3']);
    rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[2],
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.score).toEqual([
      new RankScore(new Item(2, 'item3'), new Ratio(1)),
      new RankScore(new Item(0, 'item1'), new Ratio(0.5)),
      new RankScore(new Item(1, 'item2'), new Ratio(0)),
    ]);
  });

  it('should rank on multiple dimensions', () => {
    const user = new User('0', 'user 0');
    const rankDimension1 = new RankDimension(
      '0',
      'importance',
      'low',
      'high',
      'ascending',
    );
    const rankDimension2 = new RankDimension(
      '0',
      'urgency',
      'low',
      'high',
      'ascending',
    );
    const rankAssignment = new RankAssignment();
    rankAssignment.addDimension(rankDimension1, rankDimension2);
    rankAssignment.addItems(['item1', 'item2', 'item3']);
    rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[2],
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);

    rankAssignment.rank(user, rankAssignment.dimensions[1], [
      rankAssignment.items[1],
      rankAssignment.items[0],
      rankAssignment.items[2],
    ]);
    expect(rankAssignment.score.map((score) => score.score)).toEqual([
      new Ratio(0.5),
      new Ratio(0.5),
      new Ratio(0.5),
    ]);
  });

  it('should rank for multiple users', () => {
    const user1 = new User('0', 'user 0');
    const user2 = new User('1', 'user 1');
    const rankDimension1 = new RankDimension(
      '0',
      'importance',
      'low',
      'high',
      'ascending',
    );
    const rankAssignment = new RankAssignment();
    rankAssignment.addDimension(rankDimension1);

    rankAssignment.addItems(['item1', 'item2']);
    rankAssignment.rank(user1, rankAssignment.dimensions[0], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    rankAssignment.rank(user2, rankAssignment.dimensions[0], [
      rankAssignment.items[1],
      rankAssignment.items[0],
    ]);

    expect(rankAssignment.score.map((score) => score.score)).toEqual([
      new Ratio(0.5),
      new Ratio(0.5),
    ]);
  });

  it('should rank supporting importance', () => {
    const user = new User('0', 'user 0');
    const rankDimension1 = new RankDimension(
      '0',
      'importance',
      'low',
      'high',
      'ascending',
      new Ratio(1),
    );
    const rankDimension2 = new RankDimension(
      '0',
      'urgency',
      'low',
      'high',
      'ascending',
      new Ratio(0.5),
    );
    const rankAssignment = new RankAssignment();
    rankAssignment.addDimension(rankDimension1, rankDimension2);
    rankAssignment.addItems(['item1', 'item2']);
    rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);

    rankAssignment.rank(user, rankAssignment.dimensions[1], [
      rankAssignment.items[1],
      rankAssignment.items[0],
    ]);
    expect(rankAssignment.score).toEqual([
      new RankScore(new Item(1, 'item2'), new Ratio(0.5)),
      new RankScore(new Item(0, 'item1'), new Ratio(0.25)),
    ]);
  });

  it('should support adding items and dimensions', () => {
    const user = new User('0', 'user 0');
    const rankDimension1 = new RankDimension(
      '0',
      'importance',
      'low',
      'high',
      'ascending',
      new Ratio(1),
    );
    const rankDimension2 = new RankDimension(
      '0',
      'urgency',
      'low',
      'high',
      'ascending',
      new Ratio(0.5),
    );
    const rankAssignment = new RankAssignment();
    rankAssignment.addDimension(rankDimension1, rankDimension2);

    expect(rankAssignment.rankingComplete).toBe(false);
    expect(() => rankAssignment.score).toThrowError('Ranking not complete');
    rankAssignment.rank(user, rankAssignment.dimensions[0], []);

    rankAssignment.rank(user, rankAssignment.dimensions[1], []);
    expect(rankAssignment.rankingComplete).toBe(true);
    expect(rankAssignment.score).toHaveLength(0);

    rankAssignment.addItems(['item1', 'item2']);
    expect(rankAssignment.rankingComplete).toBe(false);
    expect(() => rankAssignment.score).toThrowError('Ranking not complete');
    rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.rankingComplete).toBe(false);

    rankAssignment.rank(user, rankAssignment.dimensions[1], [
      rankAssignment.items[1],
      rankAssignment.items[0],
    ]);
    expect(rankAssignment.rankingComplete).toBe(true);
    expect(rankAssignment.score).toHaveLength(2);

    rankAssignment.addDimension(
      new RankDimension(
        '0',
        'complexity',
        'low',
        'high',
        'ascending',
        new Ratio(0.5),
      ),
    );
    expect(rankAssignment.rankingComplete).toBe(false);
    expect(() => rankAssignment.score).toThrowError('Ranking not complete');
    rankAssignment.rank(user, rankAssignment.dimensions[2], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.rankingComplete).toBe(true);
  });

  it('should give items unique ids', () => {
    const rankAssignment = new RankAssignment();
    rankAssignment.addItems(['item1', 'item2']);
    rankAssignment.addItems(['item3', 'item4']);
    expect(rankAssignment.items[0].id).toBe(0);
    expect(rankAssignment.items[1].id).toBe(1);
    expect(rankAssignment.items[2].id).toBe(2);
    expect(rankAssignment.items[3].id).toBe(3);
  });

  it('should serialize to a yjs document', () => {
    const user = new User('0', 'user 0');
    const rankAssignment = new RankAssignment();
    rankAssignment.addItems(['item1', 'item2']);
    rankAssignment.addDimension(
      new RankDimension('0', 'importance', 'low', 'high', 'ascending'),
    );

    rankAssignment.rank(user, rankAssignment.dimensions[0], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);

    const json = rankAssignment.serialize();
    const yDoc = deserializeJsonToYDoc(json);
    expect(yDoc.toJSON().root).toEqual(json);
    expect(json).toMatchInlineSnapshot(`
      {
        "dimensions": [
          {
            "direction": "ascending",
            "id": "0",
            "importance": 1,
            "labelEnd": "high",
            "labelStart": "low",
            "name": "importance",
          },
        ],
        "items": [
          {
            "id": 0,
            "label": "item1",
          },
          {
            "id": 1,
            "label": "item2",
          },
        ],
        "rankingsByUser": [
          {
            "ranking": {
              "rankings": [
                {
                  "dimension": "0",
                  "ranking": [
                    0,
                    1,
                  ],
                },
              ],
            },
            "user": {
              "id": "0",
              "name": "user 0",
            },
          },
        ],
      }
    `);

    const rankAssignment2 = RankAssignment.deserialize(json);
    expect(rankAssignment2).toEqual(rankAssignment);
  });
});
