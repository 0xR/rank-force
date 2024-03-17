import { useMemo, useState } from 'react';
import { Item } from './core/Item.ts';
import { RankAssignment } from './core/RankAssignment.ts';
import { RankDimension } from './core/RankDimension.ts';

function Dimension({
  dimension,
  items,
}: {
  dimension: RankDimension;
  items: Item[];
}) {
  const [rank, setRank] = useState(0);
  return (
    <div>
      <h1>{dimension.name}</h1>
      <ul>
        {items.map((item) => (
          <li>{item.label}</li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const rankAssigment = useMemo(() => {
    const rankDimension1 = new RankDimension(
      '0',
      'importance',
      'low',
      'high',
      'ascending',
    );
    const rankDimension2 = new RankDimension(
      '0',
      'urgency',
      'low',
      'high',
      'ascending',
    );
    const rankAssignment = new RankAssignment();
    rankAssignment.addDimension(rankDimension1, rankDimension2);
    rankAssignment.addItems(['item1', 'item2', 'item3']);
    return rankAssignment;
  }, []);

  return (
    <>
      {rankAssigment.dimensions.map((dimension) => (
        <Dimension dimension={dimension} items={rankAssigment.items} />
      ))}
    </>
  );
}

export default App;
