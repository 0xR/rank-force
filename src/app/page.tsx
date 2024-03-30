'use client';
import { Input } from '@/components/ui/input';
import { useMemo, useState } from 'react';
import { Item } from '@/core/Item';
import { RankAssignment } from '@/core/RankAssignment';
import { RankDimension } from '@/core/RankDimension';
import { RankScore } from '@/core/RankScore';
import { Ratio } from '@/core/Ratio';
import { User } from '@/core/User';
import { Sortable } from '@/app/Sortable';

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
      <h3>{dimension.name}</h3>
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

function ItemForm({ onSubmit }: { onSubmit: (itemLabel: string) => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const itemLabel = formData.get('label');

        if (typeof itemLabel !== 'string') {
          throw new Error('Expected a string');
        }
        if (!itemLabel) {
          return;
        }
        onSubmit(itemLabel);
        form.reset();
      }}
    >
      <label>
        Item to rank: <Input type="text" name={'label'} />
      </label>
      <button type="submit">Add</button>
    </form>
  );
}

function ItemList({
  items,
  onRemove,
}: {
  items: Item[];
  onRemove: (item: Item) => void;
}) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>
          {item.label} <button onClick={() => onRemove(item)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}

function DimensionForm({
  onSubmit,
}: {
  onSubmit: (dimension: RankDimension) => void;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const name = formData.get('name');
        const labelStart = formData.get('labelStart');
        const labelEnd = formData.get('labelEnd');
        const direction = formData.get('direction');

        if (
          typeof name !== 'string' ||
          typeof labelStart !== 'string' ||
          typeof labelEnd !== 'string' ||
          typeof direction !== 'string'
        ) {
          throw new Error('Expected a string');
        }

        if (!name || !labelStart || !labelEnd || !direction) {
          return;
        }

        onSubmit(
          new RankDimension(
            name,
            labelStart,
            labelEnd,
            direction as 'ascending' | 'descending',
          ),
        );
        form.reset();
      }}
    >
      <label>
        Name: <Input type="text" name={'name'} />
      </label>
      <label>
        Label start: <Input type="text" name={'labelStart'} />
      </label>
      <label>
        Label end: <Input type="text" name={'labelEnd'} />
      </label>
      <fieldset>
        <legend>Direction</legend>
        <label>
          <input type="radio" name="direction" value="ascending" />
          Ascending
        </label>
        <label>
          <input type="radio" name="direction" value="descending" />
          Descending
        </label>
      </fieldset>
      <button type="submit">Add</button>
    </form>
  );
}

function DimensionList({
  dimensions,
  onRemove,
}: {
  dimensions: RankDimension[];
  onRemove: (dimension: RankDimension) => void;
}) {
  return (
    <ul>
      {dimensions.map((dimension) => (
        <li key={dimension.id}>
          {dimension.name}: {dimension.labelStart} (
          {dimension.direction === 'ascending' ? 'worse' : 'better'}) to{' '}
          {dimension.labelEnd} (
          {dimension.direction === 'ascending' ? 'better' : 'worse'}){' '}
          <button onClick={() => onRemove(dimension)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}

function Page() {
  const [rankAssigment, setRankAssignment] = useState(() => {
    const rankDimension1 = new RankDimension(
      'importance',
      'low',
      'high',
      'ascending',
      new Ratio(1),
    );
    const rankDimension2 = new RankDimension(
      'urgency',
      'low',
      'high',
      'ascending',
      new Ratio(1),
    );
    let rankAssignment = new RankAssignment();
    rankAssignment = rankAssignment.addDimension(
      rankDimension1,
      rankDimension2,
    );
    rankAssignment = rankAssignment.addItems('item1', 'item2', 'item3');
    return rankAssignment;
  });

  const user = useMemo(() => {
    return new User('0', 'user1');
  }, []);

  return (
    <>
      <h2>Items</h2>
      <ItemForm
        onSubmit={(itemLabel) =>
          setRankAssignment(rankAssigment.addItems(itemLabel))
        }
      />
      <ItemList
        items={rankAssigment.items}
        onRemove={(item) =>
          setRankAssignment(rankAssigment.removeItems([item]))
        }
      />
      <h2>Dimensions</h2>
      <DimensionForm
        onSubmit={(dimension) => {
          setRankAssignment(rankAssigment.addDimension(dimension));
        }}
      />
      <DimensionList
        dimensions={rankAssigment.dimensions}
        onRemove={(dimension) =>
          setRankAssignment(rankAssigment.removeDimensions(dimension))
        }
      />

      <h2>Ranking</h2>
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
      <h2>Score</h2>
      {rankAssigment.score ? <Score score={rankAssigment.score} /> : <p>N/A</p>}
    </>
  );
}

export default Page;
