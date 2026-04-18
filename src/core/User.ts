import { ulid } from 'ulid';

export type User = {
  readonly id: string;
  readonly name: string;
};

export const User = {
  make(name: string, id: string = ulid()): User {
    return { id, name };
  },
};
