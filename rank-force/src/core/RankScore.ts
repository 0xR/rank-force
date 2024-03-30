import { Item } from './Item.ts';
import { Ratio } from './Ratio.ts';

export class RankScore {
  constructor(
    readonly item: Item,
    readonly score: Ratio,
  ) {}
}
