import { RankAssignment } from '@/core/RankAssignment';
import { Store } from '@/core/State';
import { Route } from '@/routes/~session/~$documentId.tsx';
import { useSessionStore } from '@/routes/~session/~$documentId/store.ts';
import { useMemo } from 'react';

export function useRankAssignment() {
  const { docUrl } = Route.useLoaderData();
  const s = useSessionStore(docUrl);
  return useMemo(() => {
    const store: Store = {
      items: s.doc.items,
      dimensions: s.doc.dimensions,
      users: s.doc.users,
      rankingsByUser: s.doc.rankingsByUser,
      dimensionWeights: s.doc.dimensionWeights,
      addItems: s.addItems,
      addDimension: s.addDimension,
      addUsers: s.addUsers,
      removeUsers: s.removeUsers,
      renameUser: s.renameUser,
      removeItems: s.removeItems,
      removeDimensions: s.removeDimensions,
      setUserRanking: s.setUserRanking,
      setDimensionWeight: s.setDimensionWeight,
    };
    return new RankAssignment(store);
  }, [s]);
}
