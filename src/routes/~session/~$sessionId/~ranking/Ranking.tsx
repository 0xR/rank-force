'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { UserRanking } from '@/core/UserRanking';
import { useRankAssignment } from '@/routes/~session/~$sessionId/shared/UseRankAssignment';
import { useUser } from '@/routes/~session/~$sessionId/shared/useUser';
import { Sortable } from '@/routes/~session/~$sessionId/~ranking/Sortable';
import { Route } from '@/routes/~session/~$sessionId/~ranking/~index.lazy.tsx';
import { Link } from '@tanstack/react-router';
import { ArrowRight, Layers, Telescope } from 'lucide-react';

function PageHeader() {
  return (
    <div className="flex items-baseline justify-between gap-4 flex-wrap pb-6 border-b border-space-4">
      <div>
        <p className="text-2xs font-mono uppercase tracking-coord text-space-6">
          Step 02 · Rank
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-cream">
          Ranking
        </h1>
      </div>
      <p className="max-w-md text-sm text-space-6 leading-relaxed">
        For each criterion, drag items from left to right and place them in
        order. Top is best.
      </p>
    </div>
  );
}

function MissingState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: { to: string; label: string };
}) {
  const params = Route.useParams();
  return (
    <div className="rounded-lg border border-dashed border-space-4 bg-space-1 p-10 text-center flex flex-col items-center gap-4">
      <Layers className="h-6 w-6 text-space-5" strokeWidth={1.25} />
      <div className="space-y-1.5">
        <h2 className="text-lg font-semibold text-cream">{title}</h2>
        <p className="text-sm text-space-6 max-w-md mx-auto">{body}</p>
      </div>
      <Button variant="default" size="default" asChild>
        <Link to={cta.to as never} params={params as never}>
          {cta.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

function DimensionPanel({
  dimension,
  items,
  userRanking,
  onChange,
  index,
  total,
}: {
  dimension: RankDimension;
  items: Item[];
  userRanking?: UserRanking;
  onChange: (items: Item[]) => void;
  index: number;
  total: number;
}) {
  const initial =
    userRanking?.rankingByDimension(dimension).map(({ item }) => item) ?? [];
  const complete = initial.length === items.length;

  return (
    <section className="rounded-xl border border-space-4 bg-space-1 p-6 flex flex-col gap-5">
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="text-2xs font-mono uppercase tracking-coord text-space-6">
            Criterion {String(index).padStart(2, '0')} of{' '}
            {String(total).padStart(2, '0')}
          </p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-cream">
            {dimension.name}
          </h2>
        </div>
        <Badge variant={complete ? 'cyan' : 'default'}>
          {complete ? 'Ranked' : `${initial.length}/${items.length} placed`}
        </Badge>
      </header>
      <Sortable
        items={items}
        onChange={onChange}
        initialRanking={initial}
        rankDimension={dimension}
      />
    </section>
  );
}

export function Ranking() {
  const rankAssigment = useRankAssignment();
  const user = useUser(rankAssigment);
  const params = Route.useParams();

  if (!user) return null;

  const ranking = rankAssigment.rankingsByUser.get(user);
  const dimensions = rankAssigment.dimensions;
  const items = rankAssigment.items;

  if (dimensions.length === 0 || items.length === 0) {
    return (
      <div className="flex flex-col gap-12">
        <PageHeader />
        {dimensions.length === 0 ? (
          <MissingState
            title="No criteria yet"
            body="Add at least one criterion before ranking. A criterion is the dimension you're ranking along."
            cta={{
              to: '/session/$sessionId/configure',
              label: 'Set up criteria',
            }}
          />
        ) : (
          <MissingState
            title="No items to rank"
            body="Add at least two items, then come back to rank them."
            cta={{
              to: '/session/$sessionId/configure',
              label: 'Add items',
            }}
          />
        )}
      </div>
    );
  }

  const allComplete = dimensions.every((d) => {
    const r = ranking?.rankingByDimension(d);
    return r && r.length === items.length;
  });

  return (
    <div className="flex flex-col gap-12">
      <PageHeader />

      <div className="flex flex-col gap-6">
        {dimensions.map((dimension, i) => (
          <DimensionPanel
            key={dimension.id}
            dimension={dimension}
            items={items}
            userRanking={ranking}
            onChange={(items) => rankAssigment.rank(user, dimension, items)}
            index={i + 1}
            total={dimensions.length}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-6 border-t border-space-4">
        <div className="flex items-center gap-2 text-sm text-space-6">
          <Telescope className="h-4 w-4" strokeWidth={1.5} />
          {allComplete
            ? 'All ranked. View the score.'
            : 'Drag the remaining items to complete each ranking.'}
        </div>
        <Button asChild variant={allComplete ? 'default' : 'secondary'}>
          <Link to="/session/$sessionId/score" params={params}>
            View score
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
