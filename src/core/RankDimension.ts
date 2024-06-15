import { ulid } from 'ulid';

export class RankDimension {
  constructor(
    readonly name: string,
    readonly labelStart: string,
    readonly labelEnd: string,
    readonly direction: 'ascending' | 'descending',
    readonly id: string = ulid(),
  ) {}

  serialize() {
    return {
      id: this.id,
      name: this.name,
      labelStart: this.labelStart,
      labelEnd: this.labelEnd,
      direction: this.direction,
    };
  }

  static deserialize(dimension: ReturnType<RankDimension['serialize']>) {
    return new RankDimension(
      dimension.name,
      dimension.labelStart,
      dimension.labelEnd,
      dimension.direction as 'ascending' | 'descending',
      dimension.id,
    );
  }
}
