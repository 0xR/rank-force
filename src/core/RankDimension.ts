import { Ratio } from './Ratio.ts';

export class RankDimension {
  constructor(
    readonly id: string,
    readonly name: string,
    readonly labelStart: string,
    readonly labelEnd: string,
    readonly direction: 'ascending' | 'descending',
    readonly importance: Ratio = new Ratio(1),
  ) {}
}
