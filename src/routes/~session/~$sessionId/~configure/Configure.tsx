import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { Ratio } from '@/core/Ratio';
import { useRankAssignment } from '@/routes/~session/~$sessionId/shared/UseRankAssignment';
import { useUser } from '@/routes/~session/~$sessionId/shared/useUser';
import {
  ArrowDown,
  ArrowUp,
  Compass,
  Layers,
  Plus,
  Telescope,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

function PageHeader() {
  return (
    <div className="flex items-baseline justify-between gap-4 flex-wrap pb-6 border-b border-space-4">
      <div>
        <p className="text-2xs font-mono uppercase tracking-coord text-space-6">
          Step 01 · Setup
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-cream">
          Set up the session
        </h1>
      </div>
      <p className="max-w-md text-sm text-space-6 leading-relaxed">
        List the items your group is choosing between, then add the criteria
        you'll rank by. Weight each criterion, and you're ready to rank.
      </p>
    </div>
  );
}

function Section({
  step,
  title,
  caption,
  icon: Icon,
  children,
}: {
  step: string;
  title: string;
  caption: string;
  icon: typeof Layers;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-[16rem_1fr] gap-x-10 gap-y-6">
      <div>
        <div className="flex items-center gap-2 text-2xs font-mono uppercase tracking-coord text-space-6">
          <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
          {step}
        </div>
        <h2 className="mt-2 text-xl font-semibold text-cream">{title}</h2>
        <p className="mt-2 text-sm text-space-6 leading-relaxed">{caption}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

function ItemForm({ onSubmit }: { onSubmit: (label: string) => void }) {
  const [label, setLabel] = useState('');
  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const v = label.trim();
        if (!v) return;
        onSubmit(v);
        setLabel('');
      }}
    >
      <Input
        name="label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Add an item…"
        aria-label="Item label"
      />
      <Button type="submit" disabled={!label.trim()}>
        <Plus className="h-4 w-4" />
        Add
      </Button>
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
  if (items.length === 0) {
    return (
      <EmptyHint>No items yet. Add at least two before ranking.</EmptyHint>
    );
  }
  return (
    <ul className="rounded-lg border border-space-4 divide-y divide-space-4 overflow-hidden">
      {items.map((item, i) => (
        <li
          key={item.id}
          className="group flex items-center gap-3 px-3 py-2.5 bg-space-1 hover:bg-space-2 transition-colors duration-150 ease-out-quart"
        >
          <span className="font-mono tabular-nums text-2xs tracking-coord text-space-5 w-7 text-right">
            {String(i + 1).padStart(2, '0')}
          </span>
          <span className="flex-1 text-cream truncate">{item.label}</span>
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 inline-flex items-center justify-center h-7 w-7 rounded text-space-6 hover:text-destructive hover:bg-space-3 transition duration-150 ease-out-quart"
            aria-label={`Remove ${item.label}`}
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </li>
      ))}
    </ul>
  );
}

function DirectionToggle({
  value,
  onChange,
}: {
  value: 'ascending' | 'descending';
  onChange: (v: 'ascending' | 'descending') => void;
}) {
  const opts = [
    {
      v: 'ascending' as const,
      icon: ArrowUp,
      label: 'Higher is better',
    },
    {
      v: 'descending' as const,
      icon: ArrowDown,
      label: 'Lower is better',
    },
  ];
  return (
    <div
      role="radiogroup"
      className="inline-flex items-center rounded-md bg-space-1 border border-space-4 p-1 gap-1"
    >
      {opts.map((o) => {
        const active = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.v)}
            className={
              active
                ? 'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium bg-cyan-bg text-cyan'
                : 'inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium text-space-6 hover:text-cream'
            }
          >
            <o.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function DimensionForm({
  onSubmit,
}: {
  onSubmit: (dimension: RankDimension) => void;
}) {
  const [name, setName] = useState('');
  const [worse, setWorse] = useState('');
  const [better, setBetter] = useState('');
  const [direction, setDirection] = useState<'ascending' | 'descending'>(
    'ascending',
  );
  const valid = name.trim() && worse.trim() && better.trim();

  return (
    <form
      className="rounded-lg border border-space-4 bg-space-1 p-5 flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!valid) return;
        const labelStart =
          direction === 'ascending' ? worse.trim() : better.trim();
        const labelEnd =
          direction === 'ascending' ? better.trim() : worse.trim();
        onSubmit(
          RankDimension.make(name.trim(), labelStart, labelEnd, direction),
        );
        setName('');
        setWorse('');
        setBetter('');
      }}
    >
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="dim-name"
          className="text-space-6 text-2xs font-mono uppercase tracking-coord"
        >
          Criterion
        </Label>
        <Input
          id="dim-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Technical depth, Time to ship, Risk"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="dim-worse"
            className="text-space-6 text-2xs font-mono uppercase tracking-coord"
          >
            Lower end
          </Label>
          <Input
            id="dim-worse"
            value={worse}
            onChange={(e) => setWorse(e.target.value)}
            placeholder="e.g. Shallow"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="dim-better"
            className="text-space-6 text-2xs font-mono uppercase tracking-coord"
          >
            Higher end
          </Label>
          <Input
            id="dim-better"
            value={better}
            onChange={(e) => setBetter(e.target.value)}
            placeholder="e.g. Deep"
            required
          />
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
        <DirectionToggle value={direction} onChange={setDirection} />
        <Button type="submit" disabled={!valid}>
          <Plus className="h-4 w-4" />
          Add criterion
        </Button>
      </div>
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
  const [percentValue, setPercentValue] = useState(
    Math.round(weight.value * 100),
  );
  useEffect(() => {
    setPercentValue(Math.round(weight.value * 100));
  }, [weight.value]);

  const worse =
    dimension.direction === 'ascending'
      ? dimension.labelStart
      : dimension.labelEnd;
  const better =
    dimension.direction === 'ascending'
      ? dimension.labelEnd
      : dimension.labelStart;

  return (
    <div className="rounded-lg border border-space-4 bg-space-1 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-cream tracking-tight truncate">
            {dimension.name}
          </h3>
          <p className="mt-1 text-sm text-space-6 truncate">
            <span className="text-space-5">{worse}</span>
            <span className="mx-2 text-space-5">→</span>
            <span className="text-cream">{better}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center justify-center h-8 w-8 rounded text-space-6 hover:text-destructive hover:bg-space-3 transition duration-150 ease-out-quart"
          aria-label="Remove criterion"
        >
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>

      <div className="flex items-center gap-4 pt-1">
        <span className="text-2xs font-mono uppercase tracking-coord text-space-6 w-16 shrink-0">
          Weight
        </span>
        <Slider
          value={[percentValue]}
          onValueChange={(v) => setPercentValue(v[0])}
          onValueCommit={(v) => onChangeWeight(new Ratio(v[0] / 100))}
          min={1}
          max={100}
          step={1}
          aria-label={`${dimension.name} weight`}
        />
        <span className="font-mono tabular-nums text-sm text-cream w-12 text-right">
          {percentValue}%
        </span>
      </div>
    </div>
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
  if (dimensions.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {dimensions.map(([dimension, ratio]) => (
        <DimensionCard
          key={dimension.id}
          dimension={dimension}
          weight={ratio}
          onRemove={() => onRemove(dimension)}
          onChangeWeight={(r) => onChangeWeight(dimension, r)}
        />
      ))}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-space-5 italic">{children}</p>;
}

export function Configure() {
  const rankAssigment = useRankAssignment();
  const user = useUser(rankAssigment);

  if (!user) return null;

  const dimensionEntries = Array.from(rankAssigment.dimensionWeight.entries());
  const itemCount = rankAssigment.items.length;
  const ready = dimensionEntries.length > 0 && itemCount >= 2;

  return (
    <div className="flex flex-col gap-12">
      <PageHeader />

      <Section
        step="A · Items"
        title="Items"
        caption="The things you're choosing between. Two minimum; eight or fewer keeps ranking quick."
        icon={Layers}
      >
        <div className="flex flex-col gap-4">
          <ItemForm onSubmit={(label) => rankAssigment.addItems(label)} />
          <ItemList
            items={rankAssigment.items}
            onRemove={(item) => rankAssigment.removeItems(item)}
          />
          <p className="text-2xs font-mono uppercase tracking-coord text-space-6">
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </p>
        </div>
      </Section>

      <Section
        step="B · Criteria"
        title="Criteria"
        caption="The criteria you'll rank items by. Each one has a low and high end. Weight by how much it matters."
        icon={Compass}
      >
        <div className="flex flex-col gap-5">
          <DimensionForm
            onSubmit={(dimension) => rankAssigment.addDimension(dimension)}
          />
          {dimensionEntries.length === 0 ? (
            <EmptyHint>
              No criteria yet. For example:
              <em className="not-italic text-space-6"> Technical depth</em>,
              from
              <em className="not-italic text-space-6"> shallow</em> to
              <em className="not-italic text-space-6"> deep</em>.
            </EmptyHint>
          ) : (
            <DimensionList
              dimensions={dimensionEntries}
              onRemove={(dimension) =>
                rankAssigment.removeDimensions(dimension)
              }
              onChangeWeight={(dimension, ratio) =>
                rankAssigment.setDimensionWeight(dimension, ratio)
              }
            />
          )}
        </div>
      </Section>

      <div className="flex items-center justify-between gap-3 pt-6 border-t border-space-4">
        <div className="flex items-center gap-2 text-sm text-space-6">
          <Telescope className="h-4 w-4" strokeWidth={1.5} />
          When you're ready, head to ranking.
        </div>
        <Badge variant={ready ? 'cyan' : 'default'}>
          {ready ? 'Ready' : 'Setup incomplete'}
        </Badge>
      </div>
    </div>
  );
}
