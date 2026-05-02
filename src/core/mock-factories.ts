import { Item } from '@/core/Item';
import { RankDimension, RankDimensionDirection } from '@/core/RankDimension';
import { State } from '@/core/State';
import { User } from '@/core/User';

export type DimensionInput = {
  name: string;
  labelStart: string;
  labelEnd: string;
  direction: RankDimensionDirection;
};

export type BuildStateOptions = {
  users: number | string[];
  items: number | string[];
  dimensions: number | DimensionInput[];
  ranked: boolean;
};

export function buildState({
  users: userInput,
  items: itemInput,
  dimensions: dimensionInput,
  ranked,
}: BuildStateOptions): State {
  const userNames =
    typeof userInput === 'number'
      ? Array.from({ length: userInput }, (_, i) => `User ${i + 1}`)
      : userInput;
  const users = userNames.map((name) => User.make(name));

  const itemLabels =
    typeof itemInput === 'number'
      ? Array.from({ length: itemInput }, (_, i) => `Item ${i + 1}`)
      : itemInput;
  const items = itemLabels.map((label, i) => Item.make(label, `item-${i + 1}`));

  const dimensionDefs: DimensionInput[] =
    typeof dimensionInput === 'number'
      ? Array.from({ length: dimensionInput }, (_, i) => ({
          name: `Dimension ${i + 1}`,
          labelStart: 'low',
          labelEnd: 'high',
          direction: 'ascending',
        }))
      : dimensionInput;
  const dimensions = dimensionDefs.map((def, i) =>
    RankDimension.make(
      def.name,
      def.labelStart,
      def.labelEnd,
      def.direction,
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
