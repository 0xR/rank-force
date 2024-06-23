export class Ratio {
  constructor(readonly value: number) {
    if (value < 0 || value > 1) {
      throw new Error('Score must be between 0 and 1');
    }
  }

  get label() {
    return `${Math.round(this.value * 100)}%`;
  }

  equals(other: Ratio) {
    return this.value.toFixed(2) === other.value.toFixed(2);
  }
}
