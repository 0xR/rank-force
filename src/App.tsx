import { useMemo, useState } from 'react';
import { Item } from './core/Item.ts';
import { RankAssignment } from './core/RankAssignment.ts';
import { RankDimension } from './core/RankDimension.ts';
import { RankScore } from './core/RankScore.ts';
import { User } from './core/User.ts';
import { Sortable } from './Sortable.tsx';

function Dimension({
  dimension,
  items,
  onChange,
}: {
  dimension: RankDimension;
  items: Item[];
  onChange: (items: Item[]) => void;
}) {
  return (
    <div>
      <h1>{dimension.name}</h1>
      <Sortable items={items} onChange={onChange} />
    </div>
  );
}

function Score({ score }: { score: RankScore[] }) {
  return (
    <ul>
      {score.map((score) => (
        <li key={score.item.id}>
          {score.item.label} ({score.score.value})
        </li>
      ))}
    </ul>
  );
}

function App() {
  const [rankAssigment, setRankAssignment] = useState(() => {
    const rankDimension1 = new RankDimension(
      '0',
      'importance',
      'low',
      'high',
      'ascending',
    );
    const rankDimension2 = new RankDimension(
      '1',
      'urgency',
      'low',
      'high',
      'ascending',
    );
    let rankAssignment = new RankAssignment();
    rankAssignment = rankAssignment.addDimension(
      rankDimension1,
      rankDimension2,
    );
    rankAssignment = rankAssignment.addItems(['item1', 'item2', 'item3']);
    return rankAssignment;
  });

  const user = useMemo(() => {
    return new User('0', 'user1');
  }, []);

  return (
    <>
      <p>Status complete: {rankAssigment.rankingComplete ? 'yes' : 'no'}</p>
      <p>score:</p>
      {rankAssigment.score ? <Score score={rankAssigment.score} /> : <p>N/A</p>}

      {rankAssigment.dimensions.map((dimension) => (
        <Dimension
          key={dimension.id}
          dimension={dimension}
          items={rankAssigment.items}
          onChange={(items) => {
            setRankAssignment(rankAssigment.rank(user, dimension, items));
          }}
        />
      ))}
    </>
  );
}

export default App;
