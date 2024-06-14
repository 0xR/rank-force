'use client';
import { useRankAssignment } from '@/app/session/[sessionId]/shared/UseRankAssignment';
import { useUser } from '@/app/session/[sessionId]/shared/useUser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Typography } from '@/components/ui/typography';
import { RankScore } from '@/core/RankScore';

function ScoreList({ score }: { score: RankScore[] }) {
  return (
    <ul>
      {score.map((score) => (
        <li key={score.item.id}>
          {score.item.label} ({score.score.value.toFixed(2)})
        </li>
      ))}
    </ul>
  );
}

export function Score() {
  const rankAssigment = useRankAssignment();
  const user = useUser(rankAssigment);

  if (!user) {
    return null;
  }

  let rankingByUserEntries = Array.from(rankAssigment.rankingsByUser.entries());
  return (
    <>
      <Typography variant="h1">Score</Typography>
      {rankAssigment.score ? (
        <>
          <ScoreList score={rankAssigment.score ?? []} />
          <Tabs
            defaultValue={rankingByUserEntries.at(0)?.[0]?.id}
            className="w-[400px]"
          >
            <TabsList>
              {rankingByUserEntries.map(([user, userRanking]) => (
                <TabsTrigger key={user.id} value={user.id}>
                  {user.name}
                </TabsTrigger>
              ))}
            </TabsList>
            {rankingByUserEntries.map(([user, userRanking]) => (
              <TabsContent
                value={user.id}
                key={user.id}
                className="flex flex-col gap-6"
              >
                {Array.from(userRanking.rankings.entries()).map(
                  ([dimension, rankScores]) => (
                    <div key={dimension.id}>
                      <Typography variant="h2">{dimension.name}</Typography>
                      <Typography variant="h3">{dimension.labelEnd}</Typography>
                      <ScoreList score={rankScores} />
                      <Typography variant="h3">
                        {dimension.labelStart}
                      </Typography>
                    </div>
                  ),
                )}
              </TabsContent>
            ))}
          </Tabs>
        </>
      ) : (
        <p>N/A</p>
      )}
    </>
  );
}
