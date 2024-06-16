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
import { Slider } from '@/components/ui/slider';
import { Typography } from '@/components/ui/typography';
import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { Ratio } from '@/core/Ratio';
import React, { FormEvent, useEffect } from 'react';

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

function DimensionCard({
  dimension,
  weight,
  onRemove,
  onChangeWeight,
}: {
  dimension: RankDimension;
  weight: Ratio;
  onRemove: () => void;
  onChangeWeight: (ratio: Ratio) => void;
}) {
  const [percentValue, setPercentValue] = React.useState(
    Math.round(weight.value * 100),
  );
  useEffect(() => {
    setPercentValue(Math.round(weight.value * 100));
  }, [weight.value]);
  return (
    <Card key={dimension.id}>
      <CardHeader>
        <CardTitle>{dimension.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Typography variant="p" className="mb-6">
          {dimension.labelStart} (
          {dimension.direction === 'ascending' ? 'worse' : 'better'}) to{' '}
          {dimension.labelEnd} (
          {dimension.direction === 'ascending' ? 'better' : 'worse'}){' '}
        </Typography>
        <Typography variant="p" className="mb-3">
          Weight: {percentValue}%
        </Typography>
        <Slider
          value={[percentValue]}
          onValueChange={(value) => {
            setPercentValue(value[0]);
          }}
          onValueCommit={(value) => {
            onChangeWeight(new Ratio(value[0] / 100));
          }}
          min={1}
          max={100}
          step={1}
        />
      </CardContent>
      <CardFooter>
        <Button onClick={() => onRemove()}>Remove</Button>
      </CardFooter>
    </Card>
  );
}

function DimensionList({
  dimensions,
  onRemove,
  onChangeWeight,
}: {
  dimensions: [RankDimension, Ratio][];
  onRemove: (dimension: RankDimension) => void;
  onChangeWeight: (dimension: RankDimension, ratio: Ratio) => void;
}) {
  return (
    <>
      {dimensions.map(([dimension, ratio]) => {
        return (
          <DimensionCard
            key={dimension.id}
            dimension={dimension}
            weight={ratio}
            onRemove={() => onRemove(dimension)}
            onChangeWeight={(ratio) => onChangeWeight(dimension, ratio)}
          />
        );
      })}
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
        dimensions={Array.from(rankAssigment.dimensionWeight.entries())}
        onRemove={(dimension) => rankAssigment.removeDimensions(dimension)}
        onChangeWeight={(dimension, ratio) =>
          rankAssigment.setDimensionWeight(dimension, ratio)
        }
      />
    </>
  );
}
