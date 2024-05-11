import { RankAssignment } from '@/core/RankAssignment';
import { User } from '@/core/User';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

export function useUser(rankAssigment: RankAssignment) {
  const router = useRouter();
  // useEffect(() => {
  //   router.push(document.location.pathname + '/user');
  // }, []);

  return useMemo(() => {
    return rankAssigment.firstUser ?? new User('User');
  }, [rankAssigment]);
}
