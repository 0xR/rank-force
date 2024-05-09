import { User } from '@/core/User';
import {
  instanceToPlain,
  plainToInstance,
  Transform,
  TransformationType,
} from 'class-transformer';
import { Item } from './Item';
import { Store } from './RankAssignment';
import { RankDimension } from './RankDimension';
import { RankScore } from './RankScore';
import { Ratio } from './Ratio';

export type UserRankingsPlain = [unknown, unknown[]][];
export class UserRanking {
  @Transform(
    // Deserialize: Convert a plain object to a Map with User as keys and Role as values
    ({ type, value, obj }) => {
      if (type === TransformationType.CLASS_TO_PLAIN) {
        const rankings = value as Map<RankDimension, RankScore[]>;
        return Array.from(rankings.entries()).map(([dimension, rankScores]) => {
          return [
            instanceToPlain(dimension),
            rankScores.map((rankScore) => instanceToPlain(rankScore)),
          ];
        }) satisfies UserRankingsPlain;
      }
      if (type === TransformationType.PLAIN_TO_CLASS) {
        const plain = value as UserRankingsPlain;
        let map = new Map(
          plain.map(([dimension, rankScores]) => {
            return [
              plainToInstance(RankDimension, dimension),
              rankScores.map((rankScore) =>
                plainToInstance(RankScore, rankScore),
              ),
            ];
          }),
        );
        return map;
      }
    },
    {
      toClassOnly: true,
      toPlainOnly: true,
    },
  )
  private rankings: Map<RankDimension, RankScore[]> = new Map();

  constructor(
    private store: Store,
    public readonly user: User,
    rankings: Map<RankDimension, Item[]> = new Map(),
  ) {
    for (const [dimension, items] of rankings.entries()) {
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
        return (
          score +
          (rankScore.score.value * dimension.importance.value) /
            store.dimensions.length
        );
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
}
