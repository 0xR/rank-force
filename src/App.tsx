import { useMemo, useState } from 'react';
import { Item } from './core/Item.ts';
import { RankAssignment } from './core/RankAssignment.ts';
import { RankDimension } from './core/RankDimension.ts';
import { User } from './core/User.ts';
import { Sortable } from './Sortable.tsx';

function Dimension({
  dimension,
  items,
  user,
}: {
  dimension: RankDimension;
  items: Item[];
  user: User;
}) {
  return (
    <div>
      <h1>{dimension.name}</h1>
      <Sortable />
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
  }, []);

  const user = useMemo(() => {
    return new User('0', 'user1');
  }, []);

  return (
    <>
      {rankAssigment.dimensions.map((dimension) => (
        <Dimension
          key={dimension.id}
          dimension={dimension}
          items={rankAssigment.items}
          user={user}
        />
      ))}
    </>
  );
}

export default App;
