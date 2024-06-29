import { useStoreContext } from '@/routes/~session/~$sessionId/StateProvider';
import { RankAssignment } from '@/core/RankAssignment';
import { useMemo } from 'react';

export function useRankAssignment() {
  const store = useStoreContext();
  return useMemo(() => new RankAssignment(store), [store]);
}
