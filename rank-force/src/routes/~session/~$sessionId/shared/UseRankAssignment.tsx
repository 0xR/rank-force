import { RankAssignment } from '@/core/RankAssignment';
import { useSharedStore } from '@/routes/~session/~$sessionId/store.ts';
import { useMemo } from 'react';

export function useRankAssignment() {
  const store = useSharedStore();
  return useMemo(() => new RankAssignment(store), [store]);
}
