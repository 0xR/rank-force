import { ulid } from 'ulid';

export class User {
  constructor(
    readonly name: string,
    readonly id: string = ulid(),
  ) {}

  serialize() {
    return {
      id: this.id,
      name: this.name,
    };
  }

  static deserialize(user: ReturnType<User['serialize']>) {
    return new User(user.name, user.id);
  }
}
