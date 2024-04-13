import { ulid } from 'ulid';
import { Ratio } from './Ratio';

export class RankDimension {
  constructor(
    readonly name: string,
    readonly labelStart: string,
    readonly labelEnd: string,
    readonly direction: 'ascending' | 'descending',
    readonly importance: Ratio = new Ratio(1),
    readonly id: string = ulid(),
  ) {}

  serialize() {
    return {
      id: this.id,
      name: this.name,
      labelStart: this.labelStart,
      labelEnd: this.labelEnd,
      direction: this.direction,
      importance: this.importance.value,
    };
  }

  static deserialize(dimension: ReturnType<RankDimension['serialize']>) {
    return new RankDimension(
      dimension.name,
      dimension.labelStart,
      dimension.labelEnd,
      dimension.direction as 'ascending' | 'descending',
      new Ratio(dimension.importance),
      dimension.id,
    );
  }
}
