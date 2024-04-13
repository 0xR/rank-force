import { ulid } from 'ulid';

export class Item {
  constructor(
    readonly label: string,
    readonly id: string = ulid(),
  ) {}

  serialize() {
    return {
      id: this.id,
      label: this.label,
    };
  }

  static deserialize(item: ReturnType<Item['serialize']>) {
    return new Item(item.label, item.id);
  }
}
