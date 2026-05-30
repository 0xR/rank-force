import { Store } from '@/core/State';
import { User } from '@/core/User';
import { Item } from './Item';
import { RankDimension } from './RankDimension';
import { RankScore } from './RankScore';
import { Ratio } from './Ratio';

export class UserRanking {
  readonly rankings: Map<RankDimension, RankScore[]> = new Map();
  // Score every unranked item shares on a dimension: the mean of the bottom
  // slots they collectively occupy. Only set when the user left items unranked.
  private readonly bottomScore: Map<RankDimension, number> = new Map();

  constructor(
    private store: Store,
    public readonly user: User,
    rankings: Map<RankDimension, Item[]> = new Map(),
  ) {
    for (const [dimension, items] of rankings.entries()) {
      const R = items.length;
      const M = store.items.length;
      // Merit position p (1 = best) maps linearly to [1, 0] across all M items.
      const slotScore = (p: number) => (M <= 1 ? 1 : 1 - (p - 1) / (M - 1));

      // Ranked items take the best R slots; direction only reorders within them
      // (ascending: first-dragged is best; descending: last-dragged is best).
      const score = items.map((item, index) => {
        const p = dimension.direction === 'descending' ? R - index : index + 1;
        return new RankScore(item, new Ratio(slotScore(p)));
      });
      this.rankings.set(dimension, score);

      // Unranked items count as lowest, sharing the mean of the bottom slots.
      const U = M - R;
      if (U > 0) {
        let sum = 0;
        for (let p = R + 1; p <= M; p++) sum += slotScore(p);
        this.bottomScore.set(dimension, sum / U);
      }
    }
  }

  // The score this user assigns an item on a dimension for aggregation:
  // its ranked score, or the shared bottom score if left unranked. Returns
  // undefined when the user has not ranked anything on the dimension yet.
  scoreForItem(dimension: RankDimension, item: Item): number | undefined {
    const ranked = this.rankings.get(dimension);
    if (!ranked) return undefined;
    const found = ranked.find((rankScore) => rankScore.item.id === item.id);
    if (found) return found.score.value;
    return this.bottomScore.get(dimension);
  }

  rank(dimension: RankDimension, items: Item[]) {
    this.store.setUserRanking(
      this.user.id,
      dimension.id,
      items.map((item) => item.id),
    );
  }

  rankingByDimension(dimension: RankDimension) {
    return this.rankings.get(dimension) || [];
  }

  score(store: Store) {
    return store.items.map((item) => {
      const scoreValue = store.dimensions.reduce((score, dimension) => {
        const ranking = this.rankings.get(dimension);
        if (!ranking) {
          throw new Error(`Ranking not found for dimension ${dimension.name}`);
        }
        const rankScore = ranking.find((rankScore) => rankScore.item === item);
        if (!rankScore) {
          throw new Error(`Ranking not found for item ${item.label}`);
        }
        const dimensionWeight = this.store.dimensionWeights[dimension.id];
        if (dimensionWeight === undefined) {
          throw new Error(`Dimension weight missing for ${dimension.name}`);
        }
        return score + rankScore.score.value * dimensionWeight;
      }, 0);

      return new RankScore(item, new Ratio(scoreValue));
    });
  }

  rankingComplete(store: Store) {
    return (
      this.rankings.size === store.dimensions.length &&
      Array.from(this.rankings.values()).every(
        (ranking) => ranking.length === store.items.length,
      )
    );
  }

  removeItems(...items: Item[]) {
    for (const [dimension, rankScores] of this.rankings.entries()) {
      const withoutItems = rankScores.filter(
        (rankScore) => !items.includes(rankScore.item),
      );
      if (withoutItems.length === rankScores.length) {
        continue;
      }
      this.store.setUserRanking(
        this.user.id,
        dimension.id,
        withoutItems.map((rankScore) => rankScore.item.id),
      );
    }
  }

  removeDimensions(...rankDimensions: RankDimension[]) {
    for (const rankDimension of rankDimensions) {
      this.store.setUserRanking(this.user.id, rankDimension.id, undefined);
    }
  }
}
