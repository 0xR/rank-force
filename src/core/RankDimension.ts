import { ulid } from 'ulid';

export type RankDimensionDirection = 'ascending' | 'descending';

export type RankDimension = {
  readonly id: string;
  readonly name: string;
  readonly labelStart: string;
  readonly labelEnd: string;
  readonly direction: RankDimensionDirection;
};

export const RankDimension = {
  make(
    name: string,
    labelStart: string,
    labelEnd: string,
    direction: RankDimensionDirection,
    id: string = ulid(),
  ): RankDimension {
    return { id, name, labelStart, labelEnd, direction };
  },
};
