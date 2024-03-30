export class User {
  constructor(
    readonly id: string,
    readonly name: string,
  ) {}

  serialize() {
    return {
      id: this.id,
      name: this.name,
    };
  }

  static deserialize(user: ReturnType<User['serialize']>) {
    return new User(user.id, user.name);
  }
}
