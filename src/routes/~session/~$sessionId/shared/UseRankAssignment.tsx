import { RankAssignment } from '@/core/RankAssignment';
import { Store } from '@/core/State';
import { useSharedStore } from '@/routes/~session/~$sessionId/store.ts';
import { useMemo } from 'react';

export function useRankAssignment() {
  const s = useSharedStore();
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
      removeItems: s.removeItems,
      removeDimensions: s.removeDimensions,
      setUserRanking: s.setUserRanking,
      setDimensionWeight: s.setDimensionWeight,
    };
    return new RankAssignment(store);
  }, [s]);
}
