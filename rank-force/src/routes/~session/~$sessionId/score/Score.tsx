'use client';
import { useRankAssignment } from '@/app/session/[sessionId]/shared/UseRankAssignment';
import { useUser } from '@/app/session/[sessionId]/shared/useUser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Typography } from '@/components/ui/typography';
import { RankScore } from '@/core/RankScore';
import { useMemo } from 'react';

function ScoreList({ score }: { score: RankScore[] }) {
  if (score.length === 0) {
    return <Typography variant="p">No score</Typography>;
  }
  return (
    <ul>
      {score.map((score) => (
        <li key={score.item.id}>
          {score.item.label} ({score.score.label})
        </li>
      ))}
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

  if (!user) {
    return null;
  }

  let rankingByUserEntries = Array.from(rankAssigment.rankingsByUser.entries());
  return (
    <>
      <Typography variant="h1">Score</Typography>
      <>
        <ScoreList score={rankAssigment.score ?? []} />
        <Tabs
          defaultValue={rankingByUserEntries.at(0)?.[0]?.id}
          className="w-[400px]"
        >
          <TabsList>
            {users.map((user) => (
              <TabsTrigger key={user.id} value={user.id}>
                {user.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {users.map((user) => {
            const userRanking = rankAssigment.rankingsByUser.get(user);
            return (
              <TabsContent
                value={user.id}
                key={user.id}
                className="flex flex-col gap-6"
              >
                {rankAssigment.dimensions.map((dimension) => {
                  const rankScores =
                    userRanking?.rankingByDimension(dimension) ?? [];
                  return (
                    <div key={dimension.id}>
                      <Typography variant="h2">
                        {dimension.name}
                        {rankScores.length !== rankAssigment.items.length &&
                          ' (incomplete ranking)'}
                      </Typography>
                      <Typography variant="h3">{dimension.labelEnd}</Typography>
                      <ScoreList score={rankScores} />
                      <Typography variant="h3">
                        {dimension.labelStart}
                      </Typography>
                    </div>
                  );
                })}
              </TabsContent>
            );
          })}
        </Tabs>
      </>
    </>
  );
}
