import { Item } from './Item';
import { RankAssignment } from './RankAssignment';
import { RankDimension } from './RankDimension';
import { RankScore } from './RankScore';
import { Ratio } from './Ratio';

export class UserRanking {
  constructor(private rankings: Map<RankDimension, RankScore[]> = new Map()) {}

  rank(dimension: RankDimension, items: Item[]): UserRanking {
    const indexRatioToScore =
      dimension.direction === 'descending'
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
    return new UserRanking(new Map(this.rankings).set(dimension, score));
  }

  unrank(dimension: RankDimension): UserRanking {
    const rankingsCopy = new Map(this.rankings);
    rankingsCopy.delete(dimension);
    return new UserRanking(rankingsCopy);
  }

  rankingByDimension(dimension: RankDimension) {
    return this.rankings.get(dimension) || [];
  }

  score(rankAssignment: RankAssignment) {
    return rankAssignment.items.map((item) => {
      const scoreValue = rankAssignment.dimensions.reduce(
        (score, dimension) => {
          const ranking = this.rankings.get(dimension);
          if (!ranking) {
            throw new Error(
              `Ranking not found for dimension ${dimension.name}`,
            );
          }
          const rankScore = ranking.find(
            (rankScore) => rankScore.item === item,
          );
          if (!rankScore) {
            throw new Error(`Ranking not found for item ${item.label}`);
          }
          return (
            score +
            (rankScore.score.value * dimension.importance.value) /
              rankAssignment.dimensions.length
          );
        },
        0,
      );
      return new RankScore(item, new Ratio(scoreValue));
    });
  }

  rankingComplete(rankAssignment: RankAssignment) {
    return (
      this.rankings.size === rankAssignment.dimensions.length &&
      Array.from(this.rankings.values()).every(
        (ranking) => ranking.length === rankAssignment.items.length,
      )
    );
  }

  serialize() {
    return {
      rankings: Array.from(this.rankings.entries()).map(
        ([dimension, scores]) => ({
          dimension: dimension.id,
          ranking: scores.map((score) => score.item.id),
        }),
      ),
    };
  }

  static deserialize(
    ranking: ReturnType<UserRanking['serialize']>,
    rankAssignment: RankAssignment,
  ) {
    let userRanking = new UserRanking();
    ranking.rankings.forEach(({ dimension, ranking }) => {
      const rankDimension = rankAssignment.dimensions.find(
        (d) => d.id === dimension,
      );
      if (!rankDimension) {
        throw new Error(`Dimension ${dimension} not found`);
      }
      const items = ranking.map((itemId) => {
        const item = rankAssignment.items.find((item) => item.id === itemId);
        if (!item) {
          throw new Error(`Item ${itemId} not found`);
        }
        return item;
      });
      userRanking = userRanking.rank(rankDimension, items);
    });
    return userRanking;
  }
}
