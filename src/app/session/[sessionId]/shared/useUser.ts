import { createRoutePaths } from '@/app/session/[sessionId]/shared/route-paths';
import { RankAssignment } from '@/core/RankAssignment';
import { User } from '@/core/User';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export function useUserState(rankAssigment: RankAssignment) {
  const params = useParams();
  const [userId, setUserId] = useLocalStorage<string | null>(
    `rank-force-${params.sessionId}-userid`,
    null,
    {
      initializeWithValue: false,
    },
  );

  const user = useMemo(() => {
    if (!userId) {
      return undefined;
    }
    return rankAssigment.usersById.get(userId);
  }, [rankAssigment, userId]);

  const setUserName = useCallback(
    (name: string) => {
      const user = new User(name);
      rankAssigment.addUser(user);
      setUserId(user.id);
    },
    [rankAssigment, setUserId],
  );

  return [user, setUserName] as const;
}

export function useUser(rankAssignment: RankAssignment) {
  const router = useRouter();
  const { sessionId } = useParams();
  const [user] = useUserState(rankAssignment);
  const pathname = usePathname();
  useEffect(() => {
    if (user) {
      return;
    }
    if (pathname.match(new RegExp('/user/?$'))) {
      return;
    }
    router.push(createRoutePaths(sessionId).user);
  }, [pathname, router, sessionId, user]);

  return user;
}
