import { Store } from '@/core/State';
import { User } from '@/core/User';
import { Item } from './Item';
import { RankDimension } from './RankDimension';
import { RankScore } from './RankScore';
import { Ratio } from './Ratio';

export class UserRanking {
  readonly rankings: Map<RankDimension, RankScore[]> = new Map();

  constructor(
    private store: Store,
    public readonly user: User,
    rankings: Map<RankDimension, Item[]> = new Map(),
  ) {
    for (const [dimension, items] of rankings.entries()) {
      const indexRatioToScore =
        dimension.direction === 'ascending'
          ? (indexRatio: number) => 1 - indexRatio
          : (indexRatio: number) => indexRatio;

      const score = items.map(
        (item, index) =>
          new RankScore(
            item,
            new Ratio(
              indexRatioToScore(
                items.length === 1 ? 1 : index / (items.length - 1),
              ),
            ),
          ),
      );
      this.rankings.set(dimension, score);
    }
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
