export class Item {
  constructor(
    readonly id: string,
    readonly label: string,
  ) {}

  serialize() {
    return {
      id: this.id,
      label: this.label,
    };
  }

  static deserialize(item: ReturnType<Item['serialize']>) {
    return new Item(item.id, item.label);
  }
}
