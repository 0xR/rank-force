'use client';
import { StarMark } from '@/components/brand/Logo';
import { MagnitudeIndex } from '@/components/brand/MagnitudeIndex';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RankAssignment } from '@/core/RankAssignment';
import { RankDimension } from '@/core/RankDimension';
import { RankScore } from '@/core/RankScore';
import { User } from '@/core/User';
import { UserRanking } from '@/core/UserRanking';
import {
  Quadrant,
  QuadrantPoint,
} from '@/routes/~session/~$documentId/~score/Quadrant';
import { useRankAssignment } from '@/routes/~session/~$documentId/shared/UseRankAssignment';
import { useUser } from '@/routes/~session/~$documentId/shared/useUser';
import { Sparkles, UserCircle2 } from 'lucide-react';
import { useMemo } from 'react';

function PageHeader() {
  return (
    <div className="flex items-baseline justify-between gap-4 flex-wrap pb-6 border-b border-space-4">
      <div>
        <p className="text-2xs font-mono uppercase tracking-coord text-space-6">
          Step 03 · Score
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-cream">
          Final score
        </h1>
      </div>
      <p className="max-w-md text-sm text-space-6 leading-relaxed">
        Weighted across every participant and every criterion. Highest score
        wins.
      </p>
    </div>
  );
}

function ScoreBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, Math.round(value * 100)));
  return (
    <div className="relative h-1.5 w-full rounded-full bg-space-3 overflow-hidden">
      <div
        className="absolute inset-y-0 left-0 bg-plasma rounded-full transition-[width] duration-300 ease-out-quart"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function Hero({ first }: { first: RankScore }) {
  return (
    <div className="relative rounded-xl border border-plasma/30 bg-gradient-to-br from-plasma-bg to-space-1 p-6 sm:p-8 overflow-hidden">
      <div className="absolute -right-6 -top-6 opacity-20">
        <StarMark className="h-32 w-32 text-plasma" />
      </div>
      <div className="relative flex items-start gap-5 flex-wrap">
        <div className="flex flex-col items-center gap-1 shrink-0">
          <span className="text-2xs font-mono uppercase tracking-coord text-plasma/80">
            Rank
          </span>
          <span className="font-mono text-5xl font-semibold text-plasma tabular-nums leading-none">
            01
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-2xs font-mono uppercase tracking-coord text-plasma/80">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
            Highest score
          </div>
          <h2 className="mt-1.5 text-3xl sm:text-4xl font-semibold text-cream tracking-tight text-balance">
            {first.item.label}
          </h2>
          <div className="mt-4 flex items-center gap-3">
            <ScoreBar value={first.score.value} />
            <span className="font-mono tabular-nums text-base text-cream w-14 text-right">
              {first.score.label}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function isUserComplete(
  ur: UserRanking,
  rankAssignment: RankAssignment,
): boolean {
  if (ur.rankings.size !== rankAssignment.dimensions.length) return false;
  for (const ranking of ur.rankings.values()) {
    if (ranking.length !== rankAssignment.items.length) return false;
  }
  return true;
}

function rankByItemId(scores: RankScore[]): Map<string, number> {
  const map = new Map<string, number>();
  scores.forEach((s, i) => map.set(s.item.id, i + 1));
  return map;
}

function aggregatePoints(
  rankAssignment: RankAssignment,
  yDimension: RankDimension,
  xDimension: RankDimension,
  aggregate: RankScore[],
): QuadrantPoint[] {
  const completeRankings = Array.from(
    rankAssignment.rankingsByUser.values(),
  ).filter((ur) => isUserComplete(ur, rankAssignment));
  if (completeRankings.length === 0) return [];

  const ranks = rankByItemId(aggregate);
  const avg = (xs: number[]) =>
    xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;

  return rankAssignment.items.map((item) => {
    const xs = completeRankings.map(
      (ur) =>
        ur.rankingByDimension(xDimension).find((s) => s.item.id === item.id)
          ?.score.value ?? 0,
    );
    const ys = completeRankings.map(
      (ur) =>
        ur.rankingByDimension(yDimension).find((s) => s.item.id === item.id)
          ?.score.value ?? 0,
    );
    return {
      itemId: item.id,
      label: item.label,
      rank: ranks.get(item.id) ?? 0,
      x: avg(xs),
      y: avg(ys),
    };
  });
}

function userPoints(
  ur: UserRanking,
  yDimension: RankDimension,
  xDimension: RankDimension,
  ranks: Map<string, number>,
): QuadrantPoint[] {
  const yScores = ur.rankingByDimension(yDimension);
  const xScores = ur.rankingByDimension(xDimension);
  return yScores.map((ys) => {
    const xs = xScores.find((s) => s.item.id === ys.item.id);
    return {
      itemId: ys.item.id,
      label: ys.item.label,
      rank: ranks.get(ys.item.id) ?? 0,
      x: xs?.score.value ?? 0,
      y: ys.score.value,
    };
  });
}

function AggregateList({ scores }: { scores: RankScore[] }) {
  if (scores.length === 0) {
    return (
      <p className="text-sm text-space-5 italic">
        No score yet. Submit at least one ranking to see it.
      </p>
    );
  }
  const [first, ...rest] = scores;
  return (
    <div className="flex flex-col gap-4">
      <Hero first={first!} />
      {rest.length > 0 && (
        <ul className="rounded-lg border border-space-4 divide-y divide-space-4 overflow-hidden bg-space-1">
          {rest.map((s, i) => {
            const rank = i + 2;
            return (
              <li key={s.item.id} className="flex items-center gap-4 px-4 py-3">
                <MagnitudeIndex rank={rank} size="md" />
                <span className="flex-1 truncate text-cream">
                  {s.item.label}
                </span>
                <div className="hidden sm:block w-40">
                  <ScoreBar value={s.score.value} />
                </div>
                <span className="font-mono tabular-nums text-sm text-space-6 w-12 text-right">
                  {s.score.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function ScoreList({ score }: { score: RankScore[] }) {
  if (score.length === 0) {
    return <p className="text-sm text-space-5 italic">No ranking submitted.</p>;
  }
  return (
    <ul className="rounded-md border border-space-4 divide-y divide-space-4 overflow-hidden">
      {score.map((s, i) => (
        <li
          key={s.item.id}
          className="flex items-center gap-3 px-3 py-2 bg-space-1"
        >
          <MagnitudeIndex rank={i + 1} size="sm" />
          <span className="flex-1 truncate text-cream text-sm">
            {s.item.label}
          </span>
          <span className="font-mono tabular-nums text-2xs tracking-coord text-space-6">
            {s.score.label}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ParticipantQuadrants({
  rankAssignment,
  users,
  yDimension,
  xDimension,
  aggregate,
}: {
  rankAssignment: RankAssignment;
  users: User[];
  yDimension: RankDimension;
  xDimension: RankDimension;
  aggregate: RankScore[];
}) {
  const ranks = useMemo(() => rankByItemId(aggregate), [aggregate]);

  return (
    <ul className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {users.map((u) => {
        const ranking = rankAssignment.rankingsByUser.get(u);
        const complete =
          ranking !== undefined && isUserComplete(ranking, rankAssignment);
        return (
          <li
            key={u.id}
            className="flex flex-col gap-2 rounded-md border border-space-4 bg-space-1 p-3"
          >
            <div className="flex items-center gap-2 min-w-0">
              <UserCircle2
                className="h-3.5 w-3.5 text-space-6 shrink-0"
                strokeWidth={1.5}
              />
              <span
                className="truncate text-2xs font-mono uppercase tracking-coord text-cream"
                title={u.name}
              >
                {u.name}
              </span>
            </div>
            {complete && ranking ? (
              <Quadrant
                yDimension={yDimension}
                xDimension={xDimension}
                points={userPoints(ranking, yDimension, xDimension, ranks)}
                variant="small"
              />
            ) : (
              <div className="aspect-[5/4] w-full rounded-md border border-dashed border-space-4 bg-space-1 flex items-center justify-center">
                <span className="text-2xs font-mono uppercase tracking-coord text-space-5 text-center px-2">
                  Ranking in progress
                </span>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function Score() {
  const rankAssigment = useRankAssignment();
  const user = useUser(rankAssigment);
  const users = useMemo(
    () => Array.from(rankAssigment.usersById.values()),
    [rankAssigment.usersById],
  );

  const aggregate = useMemo(
    () => rankAssigment.score ?? [],
    [rankAssigment.score],
  );

  const is2D = rankAssigment.dimensions.length === 2;
  const yDimension = rankAssigment.dimensions[0];
  const xDimension = rankAssigment.dimensions[1];

  const aggregateMatrixPoints = useMemo(() => {
    if (!is2D || !yDimension || !xDimension || aggregate.length === 0) {
      return [];
    }
    return aggregatePoints(rankAssigment, yDimension, xDimension, aggregate);
  }, [is2D, yDimension, xDimension, aggregate, rankAssigment]);

  if (!user) return null;

  const showMatrix =
    is2D && yDimension && xDimension && aggregateMatrixPoints.length > 0;

  return (
    <div className="flex flex-col gap-12">
      <PageHeader />

      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-cream tracking-tight">
            Aggregate score
          </h2>
          <Badge variant="default">
            {users.length} participant{users.length === 1 ? '' : 's'}
          </Badge>
        </div>

        {showMatrix && (
          <div className="w-full">
            <Quadrant
              yDimension={yDimension}
              xDimension={xDimension}
              points={aggregateMatrixPoints}
              variant="aggregate"
            />
          </div>
        )}

        <AggregateList scores={aggregate} />
      </section>

      {users.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-cream tracking-tight">
            By participant
          </h2>

          {is2D && yDimension && xDimension ? (
            <ParticipantQuadrants
              rankAssignment={rankAssigment}
              users={users}
              yDimension={yDimension}
              xDimension={xDimension}
              aggregate={aggregate}
            />
          ) : (
            <Tabs defaultValue={users[0]!.id} className="w-full">
              <TabsList className="overflow-x-auto">
                {users.map((u) => (
                  <TabsTrigger key={u.id} value={u.id}>
                    <UserCircle2
                      className="h-3.5 w-3.5 mr-2 text-space-6"
                      strokeWidth={1.5}
                    />
                    {u.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {users.map((u) => {
                const userRanking = rankAssigment.rankingsByUser.get(u);
                return (
                  <TabsContent
                    key={u.id}
                    value={u.id}
                    className="flex flex-col gap-6"
                  >
                    {rankAssigment.dimensions.map((dimension) => {
                      const rankScores =
                        userRanking?.rankingByDimension(dimension) ?? [];
                      const incomplete =
                        rankScores.length !== rankAssigment.items.length;
                      return (
                        <div
                          key={dimension.id}
                          className="rounded-lg border border-space-4 bg-space-1 p-5"
                        >
                          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                            <h3 className="text-base font-semibold text-cream tracking-tight">
                              {dimension.name}
                            </h3>
                            {incomplete && (
                              <Badge variant="default">incomplete</Badge>
                            )}
                          </div>
                          <ScoreList score={rankScores} />
                        </div>
                      );
                    })}
                  </TabsContent>
                );
              })}
            </Tabs>
          )}
        </section>
      )}
    </div>
  );
}
