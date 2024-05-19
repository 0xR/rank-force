'use client';
import { RankAssignment } from '@/core/RankAssignment';
import { User } from '@/core/User';
import { useLocalStorage } from '@uidotdev/usehooks';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';

export function useUserState(rankAssigment: RankAssignment) {
  const params = useParams();
  const router = useRouter();
  const [userId, setUserId] = useLocalStorage<string | null>(
    `rank-force-${params.sessionId}-userid`,
    null,
  );
  const user = useMemo(() => {
    if (!userId) {
      return undefined;
    }
    return rankAssigment.usersById.get(userId);
  }, [rankAssigment]);

  const setUserName = useCallback((name: string) => {
    const user = new User(name);
    rankAssigment.addUser(user);
    setUserId(user.id);
  }, []);

  return [user, setUserName] as const;
}

export function useUser(rankAssignment: RankAssignment) {
  const router = useRouter();
  const [user] = useUserState(rankAssignment);
  const pathname = usePathname();
  useEffect(() => {
    if (user) {
      return;
    }
    if (pathname.match(new RegExp('/user/?$'))) {
      return;
    }
    router.push(pathname + '/user');
  }, [user]);

  return user;
}
