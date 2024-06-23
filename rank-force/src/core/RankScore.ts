import { Item } from './Item';
import { Ratio } from './Ratio';

export class RankScore {
  constructor(
    readonly item: Item,
    readonly score: Ratio,
  ) {}
}
