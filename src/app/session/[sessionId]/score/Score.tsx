'use client';
import { useRankAssignment } from '@/app/session/[sessionId]/shared/UseRankAssignment';
import { useUser } from '@/app/session/[sessionId]/shared/useUser';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RankScore } from '@/core/RankScore';

function ScoreList({ score }: { score: RankScore[] }) {
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

export function Score() {
  const rankAssigment = useRankAssignment();
  const user = useUser(rankAssigment);

  if (!user) {
    return null;
  }

  let rankingByUserEntries = Array.from(rankAssigment.rankingsByUser.entries());
  return (
    <>
      <h2>Score</h2>
      {rankAssigment.score || true ? (
        <>
          <ScoreList score={rankAssigment.score ?? []} />
          <Tabs
            defaultValue={rankingByUserEntries.at(0)?.at(0)?.id}
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
              <TabsContent value={user.id} key={user.id}>
                {Array.from(userRanking.rankings.entries()).map(
                  ([dimension, rankScores]) => (
                    <div key={dimension.id}>
                      <h3>{dimension.name}</h3>
                      <ScoreList score={rankScores} />
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
