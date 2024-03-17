import { Item } from './Item.ts';
import { RankAssignment } from './RankAssignment.ts';
import { RankDimension } from './RankDimension.ts';
import { RankScore } from './RankScore.ts';
import { Ratio } from './Ratio.ts';

export class UserRanking {
  private rankings: Map<RankDimension, RankScore[]> = new Map();

  rank(dimension: RankDimension, items: Item[]) {
    const descendingItems =
      dimension.direction === 'descending' ? items : items.toReversed();
    const score = descendingItems.map(
      (item, index) =>
        new RankScore(item, new Ratio(1 - index / (items.length - 1))),
    );
    this.rankings.set(dimension, score);
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
}
