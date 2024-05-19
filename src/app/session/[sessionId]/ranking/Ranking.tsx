'use client';
import { Sortable } from '@/app/session/[sessionId]/ranking/Sortable';
import { useRankAssignment } from '@/app/session/[sessionId]/shared/UseRankAssignment';
import { useUser } from '@/app/session/[sessionId]/shared/useUser';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { RankScore } from '@/core/RankScore';
import { UserRanking } from '@/core/UserRanking';

function Dimension({
  dimension,
  items,
  onChange,
  userRanking,
}: {
  dimension: RankDimension;
  items: Item[];
  onChange: (items: Item[]) => void;
  userRanking?: UserRanking;
}) {
  return (
    <div>
      <h3>{dimension.name}</h3>
      <Sortable
        items={items}
        onChange={onChange}
        initialRanking={
          userRanking?.rankingByDimension(dimension).map(({ item }) => item) ??
          []
        }
      />
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
      <Label>
        Item to rank: <Input type="text" name={'label'} />
      </Label>
      <Button type="submit">Add item</Button>
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
          {item.label} <Button onClick={() => onRemove(item)}>Remove</Button>
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
      <Label>
        Name: <Input type="text" name={'name'} required />
      </Label>
      <Label>
        Label start: <Input type="text" name={'labelStart'} required />
      </Label>
      <Label>
        Label end: <Input type="text" name={'labelEnd'} required />
      </Label>
      <RadioGroup name="direction" defaultValue="ascending">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="ascending" id="r1" />
          <Label htmlFor="r1">Ascending</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="descending" id="r2" />
          <Label htmlFor="r2">Descending</Label>
        </div>
      </RadioGroup>
      <Button type="submit">Add</Button>
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
          <Button onClick={() => onRemove(dimension)}>Remove</Button>
        </li>
      ))}
    </ul>
  );
}

export function Ranking() {
  const rankAssigment = useRankAssignment();
  const user = useUser(rankAssigment);

  if (!user) {
    return null;
  }

  const ranking = rankAssigment.rankingsByUser.get(user);

  return (
    <>
      <h2>state</h2>
      <h2>Items</h2>
      <ItemForm onSubmit={(itemLabel) => rankAssigment.addItems(itemLabel)} />
      <ItemList
        items={rankAssigment.items}
        onRemove={(item) => rankAssigment.removeItems(item)}
      />
      <h2>Dimensions</h2>
      <DimensionForm
        onSubmit={(dimension) => {
          rankAssigment.addDimension(dimension);
        }}
      />
      <DimensionList
        dimensions={rankAssigment.dimensions}
        onRemove={(dimension) => rankAssigment.removeDimensions(dimension)}
      />

      <h2>Ranking</h2>
      {rankAssigment.dimensions.map((dimension) => (
        <Dimension
          key={dimension.id}
          dimension={dimension}
          items={rankAssigment.items}
          userRanking={ranking}
          onChange={(items) => {
            rankAssigment.rank(user, dimension, items);
          }}
        />
      ))}
      <h2>Score</h2>
      {rankAssigment.score ? <Score score={rankAssigment.score} /> : <p>N/A</p>}
    </>
  );
}
