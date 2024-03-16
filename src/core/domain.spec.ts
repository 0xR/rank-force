class RankDimension {
  constructor(
    readonly name: string,
    readonly dimensionStart: string,
    readonly dimensionEnd: string
    , readonly direction: "ascending" | "descending", readonly importance: Ratio = new Ratio(1)) {}
}

class Item {
  constructor(
    readonly id: number,
    readonly value: string
  ) {}
}

class RankScore {
  constructor(
    readonly item: Item,
    readonly score: Ratio,
  ) {}
}

class RankAssignment {
  items: Item[] = [];

  private rankings: Map<RankDimension, RankScore[]> = new Map();

  constructor(
    readonly dimensions: RankDimension[]
  ) {}

  addItems(items: string[]) {
    this.items = items.map((item, index) => new Item(index, item));
  }

  rank(dimension: RankDimension, items: Item[]) {
    if (!this.dimensions.includes(dimension)) {
      throw new Error(`Dimension ${dimension.name} not found in assigment`);
    }
    if (items.length !== this.items.length) {
      throw new Error('Ranking length does not match item length');
    }
    items.forEach(item => {
      if (!this.items.includes(item)) {
        throw new Error(`Item ${item.value} not found in assignment`);
      }
    });
    const descendingItems = this.dimensions[0].direction === "descending" ? items : items.toReversed()
    const score = descendingItems.map((item, index) => new RankScore(item, new Ratio(1 - (index / (items.length - 1)))));
    this.rankings.set(dimension, score);
  }
  
  get score() {
    if (!this.rankingComplete) {
      throw new Error('Ranking not complete');
    }
    const scores = this.items.map(item => {
      const scoreValue = this.dimensions.reduce((score, dimension) => {
        const ranking = this.rankings.get(dimension);
        if (!ranking) {
          throw new Error(`Ranking not found for dimension ${dimension.name}`);
        }
        const rankScore = ranking.find(rankScore => rankScore.item === item);
        if (!rankScore) {
          throw new Error(`Ranking not found for item ${item.value}`);
        }
        return score + (rankScore.score.value * dimension.importance.value / this.dimensions.length);
      }, 0);
      return new RankScore(item, new Ratio(scoreValue));
    });
    return scores.sort((a, b) => b.score.value - a.score.value);
  }
  
  get rankingComplete() {
    return this.rankings.size === this.dimensions.length;
  }
}

class Ratio {
  constructor(
    readonly value: number
  ) {
    if (value < 0 || value > 1) {
      throw new Error('Score must be between 0 and 1');
    }
  }
}


describe('Domain', () => {
  it('should rank on a single dimension', () => {
    const rankDimension = new RankDimension("importance", 'low', 'high', 'ascending');
    const rankAssignment = new RankAssignment([rankDimension]);
    rankAssignment.addItems([
      'item1',
      'item2',
      'item3',
    ]);
    rankAssignment.rank(rankAssignment.dimensions[0], [
      rankAssignment.items[2],
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.score).toEqual([
      new RankScore(new Item(1, 'item2'), new Ratio(1)),
      new RankScore(new Item(0, 'item1'), new Ratio(0.5)),
      new RankScore(new Item(2, 'item3'), new Ratio(0)),
    ]);
  });

  it('should rank on a single descending dimension', () => {
    const rankDimension = new RankDimension("importance", 'high', 'low', 'descending');
    const rankAssignment = new RankAssignment([rankDimension]);
    rankAssignment.addItems([
      'item1',
      'item2',
      'item3',
    ]);
    rankAssignment.rank(rankAssignment.dimensions[0], [
      rankAssignment.items[2],
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    expect(rankAssignment.score).toEqual([
      new RankScore(new Item(2, 'item3'), new Ratio(1)),
      new RankScore(new Item(0, 'item1'), new Ratio(0.5)),
      new RankScore(new Item(1, 'item2'), new Ratio(0)),
    ]);
  });
  
  it('should rank on multiple dimensions', () => {
    const rankDimension1 = new RankDimension("importance", 'low', 'high', 'ascending');
    const rankDimension2 = new RankDimension("urgency", 'low', 'high', 'ascending');
    const rankAssignment = new RankAssignment([rankDimension1, rankDimension2]);
    rankAssignment.addItems([
      'item1',
      'item2',
      'item3',
    ]);
    rankAssignment.rank(rankAssignment.dimensions[0], [
      rankAssignment.items[2],
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);
    
    rankAssignment.rank(rankAssignment.dimensions[1], [
      rankAssignment.items[1],
      rankAssignment.items[0],
      rankAssignment.items[2],
    ]);
    expect(rankAssignment.score.map(score => score.score)).toEqual([
      new Ratio(0.5),
      new Ratio(0.5),
      new Ratio(0.5),
    ]);
  });

  it('should rank supporting importance', () => {
    const rankDimension1 = new RankDimension("importance", 'low', 'high', 'ascending', new Ratio(1));
    const rankDimension2 = new RankDimension("urgency", 'low', 'high', 'ascending', new Ratio(0.5));
    const rankAssignment = new RankAssignment([rankDimension1, rankDimension2]);
    rankAssignment.addItems([
      'item1',
      'item2',
    ]);
    rankAssignment.rank(rankAssignment.dimensions[0], [
      rankAssignment.items[0],
      rankAssignment.items[1],
    ]);

    rankAssignment.rank(rankAssignment.dimensions[1], [
      rankAssignment.items[1],
      rankAssignment.items[0],
    ]);
    expect(rankAssignment.score).toEqual([
      new RankScore(new Item(1, 'item2'), new Ratio(0.5)),
      new RankScore(new Item(0, 'item1'), new Ratio(0.25)),
    ]);
  });
});
