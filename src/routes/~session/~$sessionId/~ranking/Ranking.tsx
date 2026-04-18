'use client';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';
import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { UserRanking } from '@/core/UserRanking';
import { useRankAssignment } from '@/routes/~session/~$sessionId/shared/UseRankAssignment';
import { useUser } from '@/routes/~session/~$sessionId/shared/useUser';
import { Sortable } from '@/routes/~session/~$sessionId/~ranking/Sortable';
import { Route } from '@/routes/~session/~$sessionId/~ranking/~index.lazy.tsx';
import { Link } from '@tanstack/react-router';

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
      <Typography variant="h3">{dimension.name}</Typography>
      <Sortable
        items={items}
        onChange={onChange}
        initialRanking={
          userRanking?.rankingByDimension(dimension).map(({ item }) => item) ??
          []
        }
        rankDimension={dimension}
      />
    </div>
  );
}

export function Ranking() {
  const rankAssigment = useRankAssignment();
  const user = useUser(rankAssigment);

  const params = Route.useParams();

  if (!user) {
    return null;
  }

  const ranking = rankAssigment.rankingsByUser.get(user);

  return (
    <>
      <Typography variant="h2">Ranking</Typography>
      {rankAssigment.dimensions.length === 0 ? (
        <>
          <p>No dimensions defined yet</p>
          <Button variant="link" asChild>
            <Link to="/session/$sessionId/configure" params={params}>
              Go to configure
            </Link>
          </Button>
        </>
      ) : rankAssigment.items.length === 0 ? (
        <>
          <p>No items defined yet</p>
          <Button variant="link" asChild>
            <Link to="/session/$sessionId/configure" params={params}>
              Go to configure
            </Link>
          </Button>
        </>
      ) : (
        <>
          <Typography variant="p">
            Drag items to the right to rank them
          </Typography>
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
        </>
      )}
    </>
  );
}
