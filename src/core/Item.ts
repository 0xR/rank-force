import { ulid } from 'ulid';

export type Item = {
  readonly id: string;
  readonly label: string;
};

export const Item = {
  make(label: string, id: string = ulid()): Item {
    return { id, label };
  },
  includes(items: Item[], item: Item): boolean {
    return items.some((i) => i.id === item.id);
  },
};
