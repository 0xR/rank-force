import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { State } from '@/core/State';
import { User } from '@/core/User';

export type BuildStateOptions = {
  users: number;
  items: number;
  dimensions: number;
  ranked: boolean;
};

export function buildState({
  users: userCount,
  items: itemCount,
  dimensions: dimensionCount,
  ranked,
}: BuildStateOptions): State {
  const users = Array.from({ length: userCount }, (_, i) =>
    User.make(`User ${i + 1}`, `user-${i + 1}`),
  );
  const items = Array.from({ length: itemCount }, (_, i) =>
    Item.make(`Item ${i + 1}`, `item-${i + 1}`),
  );
  const dimensions = Array.from({ length: dimensionCount }, (_, i) =>
    RankDimension.make(
      `Dimension ${i + 1}`,
      'low',
      'high',
      'ascending',
      `dimension-${i + 1}`,
    ),
  );

  const rankingsByUser: Record<string, Record<string, string[]>> = {};
  if (ranked) {
    users.forEach((user, userIndex) => {
      const byDim: Record<string, string[]> = {};
      dimensions.forEach((dim, dimIndex) => {
        const shift = userIndex + dimIndex;
        byDim[dim.id] = Array.from(
          { length: items.length },
          (_, k) => items[(k + shift) % items.length]!.id,
        );
      });
      rankingsByUser[user.id] = byDim;
    });
  }

  const dimensionWeights: Record<string, number> = {};
  if (dimensions.length > 0) {
    const evenWeight = 1 / dimensions.length;
    dimensions.forEach((dim) => {
      dimensionWeights[dim.id] = evenWeight;
    });
  }

  return {
    users,
    items,
    dimensions,
    rankingsByUser,
    dimensionWeights,
  };
}
