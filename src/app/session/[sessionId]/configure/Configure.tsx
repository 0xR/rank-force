'use client';
import { useRankAssignment } from '@/app/session/[sessionId]/shared/UseRankAssignment';
import { useUser } from '@/app/session/[sessionId]/shared/useUser';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Typography } from '@/components/ui/typography';
import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import React, { FormEvent } from 'react';

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
  const [direction, setDirection] = React.useState<'ascending' | 'descending'>(
    'ascending',
  );
  return (
    <form
      className="flex flex-col gap-2"
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
        Label top ({direction === 'ascending' ? 'better' : 'worse'}):{' '}
        <Input type="text" name={'labelEnd'} required />
      </Label>
      <Label>
        Label bottom ({direction === 'ascending' ? 'worse' : 'better'}):{' '}
        <Input type="text" name={'labelStart'} required />
      </Label>
      <RadioGroup
        name="direction"
        defaultValue={direction}
        onChange={(e: FormEvent) => {
          setDirection(
            (e.target as HTMLInputElement).value as 'ascending' | 'descending',
          );
        }}
      >
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
    <>
      {dimensions.map((dimension) => (
        <Card key={dimension.id}>
          <CardHeader>
            <CardTitle>{dimension.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {dimension.labelStart} (
            {dimension.direction === 'ascending' ? 'worse' : 'better'}) to{' '}
            {dimension.labelEnd} (
            {dimension.direction === 'ascending' ? 'better' : 'worse'}){' '}
          </CardContent>
          <CardFooter>
            <Button onClick={() => onRemove(dimension)}>Remove</Button>
          </CardFooter>
        </Card>
      ))}
    </>
  );
}

export function Configure() {
  const rankAssigment = useRankAssignment();
  const user = useUser(rankAssigment);

  if (!user) {
    return null;
  }

  return (
    <>
      <Typography variant="h2">Items</Typography>
      <ItemForm onSubmit={(itemLabel) => rankAssigment.addItems(itemLabel)} />
      <ItemList
        items={rankAssigment.items}
        onRemove={(item) => rankAssigment.removeItems(item)}
      />
      <Typography variant="h2">Dimensions</Typography>
      <DimensionForm
        onSubmit={(dimension) => {
          rankAssigment.addDimension(dimension);
        }}
      />
      <DimensionList
        dimensions={rankAssigment.dimensions}
        onRemove={(dimension) => rankAssigment.removeDimensions(dimension)}
      />
    </>
  );
}
