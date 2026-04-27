import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { RankTemplate, rankTemplates } from '@/core/RankTemplate';
import { Ratio } from '@/core/Ratio';
import { User } from '@/core/User';
import { useRankAssignment } from '@/routes/~session/~$documentId/shared/UseRankAssignment';
import { useUser } from '@/routes/~session/~$documentId/shared/useUser';
import {
  ArrowDown,
  ArrowUp,
  Check,
  Compass,
  Layers,
  ListPlus,
  Pencil,
  Plus,
  Telescope,
  UserCircle2,
  Users,
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

function BulkItemEditor({
  initialValue,
  onSave,
  onCancel,
}: {
  initialValue: string;
  onSave: (labels: string[]) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(value.split('\n'));
      }}
    >
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onSave(value.split('\n'));
          }
        }}
        placeholder={'One item per line…'}
        aria-label="Items, one per line"
        rows={Math.max(6, value.split('\n').length + 1)}
        autoFocus
      />
      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save list</Button>
      </div>
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

function DimensionFields({
  idPrefix,
  name,
  setName,
  worse,
  setWorse,
  better,
  setBetter,
  direction,
  setDirection,
  namePlaceholder,
  worsePlaceholder,
  betterPlaceholder,
}: {
  idPrefix: string;
  name: string;
  setName: (v: string) => void;
  worse: string;
  setWorse: (v: string) => void;
  better: string;
  setBetter: (v: string) => void;
  direction: 'ascending' | 'descending';
  setDirection: (v: 'ascending' | 'descending') => void;
  namePlaceholder?: string;
  worsePlaceholder?: string;
  betterPlaceholder?: string;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={`${idPrefix}-name`}
          className="text-space-6 text-2xs font-mono uppercase tracking-coord"
        >
          Criterion
        </Label>
        <Input
          id={`${idPrefix}-name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={namePlaceholder}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor={`${idPrefix}-worse`}
            className="text-space-6 text-2xs font-mono uppercase tracking-coord"
          >
            Lower end
          </Label>
          <Input
            id={`${idPrefix}-worse`}
            value={worse}
            onChange={(e) => setWorse(e.target.value)}
            placeholder={worsePlaceholder}
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor={`${idPrefix}-better`}
            className="text-space-6 text-2xs font-mono uppercase tracking-coord"
          >
            Higher end
          </Label>
          <Input
            id={`${idPrefix}-better`}
            value={better}
            onChange={(e) => setBetter(e.target.value)}
            placeholder={betterPlaceholder}
            required
          />
        </div>
      </div>

      <div className="pt-1">
        <DirectionToggle value={direction} onChange={setDirection} />
      </div>
    </div>
  );
}

function buildDimension(
  name: string,
  worse: string,
  better: string,
  direction: 'ascending' | 'descending',
  id?: string,
): RankDimension {
  const labelStart = direction === 'ascending' ? worse.trim() : better.trim();
  const labelEnd = direction === 'ascending' ? better.trim() : worse.trim();
  return RankDimension.make(name.trim(), labelStart, labelEnd, direction, id);
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
        onSubmit(buildDimension(name, worse, better, direction));
        setName('');
        setWorse('');
        setBetter('');
      }}
    >
      <DimensionFields
        idPrefix="dim-new"
        name={name}
        setName={setName}
        worse={worse}
        setWorse={setWorse}
        better={better}
        setBetter={setBetter}
        direction={direction}
        setDirection={setDirection}
        namePlaceholder="e.g. Technical depth, Time to ship, Risk"
        worsePlaceholder="e.g. Shallow"
        betterPlaceholder="e.g. Deep"
      />
      <div className="flex items-center justify-end pt-1">
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
  onEdit,
  onChangeWeight,
}: {
  dimension: RankDimension;
  weight: Ratio;
  onRemove: () => void;
  onEdit: (updated: RankDimension) => void;
  onChangeWeight: (ratio: Ratio) => void;
}) {
  const [percentValue, setPercentValue] = useState(
    Math.round(weight.value * 100),
  );
  useEffect(() => {
    setPercentValue(Math.round(weight.value * 100));
  }, [weight.value]);

  const initialWorse =
    dimension.direction === 'ascending'
      ? dimension.labelStart
      : dimension.labelEnd;
  const initialBetter =
    dimension.direction === 'ascending'
      ? dimension.labelEnd
      : dimension.labelStart;

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(dimension.name);
  const [worse, setWorse] = useState(initialWorse);
  const [better, setBetter] = useState(initialBetter);
  const [direction, setDirection] = useState(dimension.direction);
  const valid = name.trim() && worse.trim() && better.trim();

  function reset() {
    setName(dimension.name);
    setWorse(initialWorse);
    setBetter(initialBetter);
    setDirection(dimension.direction);
  }

  return (
    <div className="rounded-lg border border-space-4 bg-space-1 p-5 flex flex-col gap-4">
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!valid) return;
            onEdit(
              buildDimension(name, worse, better, direction, dimension.id),
            );
            setEditing(false);
          }}
          className="flex flex-col gap-4"
        >
          <DimensionFields
            idPrefix={`dim-${dimension.id}`}
            name={name}
            setName={setName}
            worse={worse}
            setWorse={setWorse}
            better={better}
            setBetter={setBetter}
            direction={direction}
            setDirection={setDirection}
          />
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                reset();
                setEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!valid}>
              <Check className="h-4 w-4" />
              Save criterion
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-cream tracking-tight truncate">
              {dimension.name}
            </h3>
            <p className="mt-1 text-sm text-space-6 truncate">
              <span className="text-space-5">{initialWorse}</span>
              <span className="mx-2 text-space-5">→</span>
              <span className="text-cream">{initialBetter}</span>
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center justify-center h-8 w-8 rounded text-space-6 hover:text-cream hover:bg-space-3 transition duration-150 ease-out-quart"
              aria-label={`Edit ${dimension.name}`}
            >
              <Pencil className="h-4 w-4" strokeWidth={1.5} />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="inline-flex items-center justify-center h-8 w-8 rounded text-space-6 hover:text-destructive hover:bg-space-3 transition duration-150 ease-out-quart"
              aria-label={`Remove ${dimension.name}`}
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 pt-1">
        <span className="text-2xs font-mono uppercase tracking-coord text-space-6 w-16 shrink-0">
          Weight
        </span>
        <Slider
          value={[percentValue]}
          onValueChange={(v) => setPercentValue(v[0]!)}
          onValueCommit={(v) => onChangeWeight(new Ratio(v[0]! / 100))}
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
  onEdit,
  onChangeWeight,
}: {
  dimensions: [RankDimension, Ratio][];
  onRemove: (dimension: RankDimension) => void;
  onEdit: (updated: RankDimension) => void;
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
          onEdit={onEdit}
          onChangeWeight={(r) => onChangeWeight(dimension, r)}
        />
      ))}
    </div>
  );
}

function EmptyHint({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-space-5 italic">{children}</p>;
}

function ParticipantList({
  users,
  currentUserId,
  hasData,
  onRemove,
}: {
  users: User[];
  currentUserId: string | undefined;
  hasData: (userId: string) => boolean;
  onRemove: (user: User) => void;
}) {
  if (users.length === 0) {
    return (
      <EmptyHint>
        No one's joined yet. Share the session URL to bring people in.
      </EmptyHint>
    );
  }
  return (
    <ul className="rounded-lg border border-space-4 divide-y divide-space-4 overflow-hidden">
      {users.map((u) => {
        const isSelf = u.id === currentUserId;
        return (
          <li
            key={u.id}
            className="group flex items-center gap-3 px-3 py-2.5 bg-space-1 hover:bg-space-2 transition-colors duration-150 ease-out-quart"
          >
            <UserCircle2 className="h-4 w-4 text-space-5" strokeWidth={1.5} />
            <span className="flex-1 text-cream truncate">
              {u.name}
              {isSelf && (
                <span className="ml-2 text-2xs font-mono uppercase tracking-coord text-space-5">
                  you
                </span>
              )}
            </span>
            <button
              type="button"
              onClick={() => onRemove(u)}
              disabled={isSelf}
              title={
                isSelf
                  ? "You can't remove yourself"
                  : hasData(u.id)
                    ? `${u.name} has rankings — confirm before removing`
                    : `Remove ${u.name}`
              }
              className="opacity-0 group-hover:opacity-100 focus:opacity-100 inline-flex items-center justify-center h-7 w-7 rounded text-space-6 hover:text-destructive hover:bg-space-3 transition duration-150 ease-out-quart disabled:opacity-30 disabled:hover:text-space-6 disabled:hover:bg-transparent disabled:cursor-not-allowed"
              aria-label={`Remove ${u.name}`}
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function TemplatePicker({
  onApply,
}: {
  onApply: (template: RankTemplate) => void;
}) {
  return (
    <ul className="rounded-lg border border-space-4 divide-y divide-space-4 overflow-hidden">
      {rankTemplates.map((template) => (
        <li key={template.id}>
          <button
            type="button"
            onClick={() => onApply(template)}
            className="w-full text-left px-4 py-3 bg-space-1 hover:bg-space-2 transition-colors duration-150 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-space-0"
            aria-label={`Apply ${template.name} template`}
          >
            <div className="flex items-baseline gap-3">
              <span className="text-cream font-semibold tracking-tight">
                {template.name}
              </span>
              <span className="font-mono text-2xs uppercase tracking-coord text-space-5 truncate">
                {template.dimensions.map((d) => d.name).join(' · ')}
              </span>
            </div>
            <p className="mt-1.5 text-sm text-space-6 leading-relaxed">
              {template.description}
            </p>
          </button>
        </li>
      ))}
    </ul>
  );
}

function ItemsPanel({
  items,
  itemCount,
  onAdd,
  onRemove,
  onReplace,
}: {
  items: Item[];
  itemCount: number;
  onAdd: (label: string) => void;
  onRemove: (item: Item) => void;
  onReplace: (labels: string[]) => void;
}) {
  const [mode, setMode] = useState<'list' | 'bulk'>('list');

  if (mode === 'bulk') {
    return (
      <BulkItemEditor
        initialValue={items.map((i) => i.label).join('\n')}
        onSave={(labels) => {
          onReplace(labels);
          setMode('list');
        }}
        onCancel={() => setMode('list')}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ItemForm onSubmit={onAdd} />
      <ItemList items={items} onRemove={onRemove} />
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xs font-mono uppercase tracking-coord text-space-6">
          {itemCount} item{itemCount === 1 ? '' : 's'}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setMode('bulk')}
        >
          <ListPlus className="h-4 w-4" strokeWidth={1.5} />
          Edit as list
        </Button>
      </div>
    </div>
  );
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
        <ItemsPanel
          items={rankAssigment.items}
          itemCount={itemCount}
          onAdd={(label) => rankAssigment.addItems(label)}
          onRemove={(item) => rankAssigment.removeItems(item)}
          onReplace={(labels) => rankAssigment.replaceItems(labels)}
        />
      </Section>

      <Section
        step="B · Criteria"
        title="Criteria"
        caption="The criteria you'll rank items by. Each one has a low and high end. Weight by how much it matters."
        icon={Compass}
      >
        <div className="flex flex-col gap-5">
          {dimensionEntries.length === 0 && (
            <TemplatePicker
              onApply={(template) =>
                rankAssigment.addDimension(
                  ...RankTemplate.toDimensions(template),
                )
              }
            />
          )}
          <DimensionForm
            onSubmit={(dimension) => rankAssigment.addDimension(dimension)}
          />
          {dimensionEntries.length > 0 && (
            <DimensionList
              dimensions={dimensionEntries}
              onRemove={(dimension) =>
                rankAssigment.removeDimensions(dimension)
              }
              onEdit={(updated) => rankAssigment.editDimension(updated)}
              onChangeWeight={(dimension, ratio) =>
                rankAssigment.setDimensionWeight(dimension, ratio)
              }
            />
          )}
        </div>
      </Section>

      <Section
        step="C · Participants"
        title="Participants"
        caption="Everyone who's joined this session. Remove anyone who shouldn't be here — their rankings go with them."
        icon={Users}
      >
        <ParticipantList
          users={rankAssigment.users}
          currentUserId={user.id}
          hasData={(userId) => rankAssigment.hasRankings(userId)}
          onRemove={(target) => {
            if (rankAssigment.hasRankings(target.id)) {
              const ok = window.confirm(
                `Remove ${target.name}? They've already submitted rankings — these will be deleted.`,
              );
              if (!ok) return;
            }
            rankAssigment.removeUsers(target);
          }}
        />
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
