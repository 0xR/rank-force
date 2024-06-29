import { createRoutePaths } from '@/routes/~session/~$sessionId/shared/route-paths';
import { RankAssignment } from '@/core/RankAssignment';
import { User } from '@/core/User';
// import { useParams, usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { useIsClient, useLocalStorage } from 'usehooks-ts';

export function useUserId() {
  const params = useParams();
  return useLocalStorage<string | null>(
    `rank-force-${params.sessionId}-userid`,
    null,
    {
      initializeWithValue: false,
    },
  );
}

export function useUserState(rankAssigment: RankAssignment) {
  const [userId, setUserId] = useUserId();

  const user = useMemo(() => {
    if (!userId) {
      return undefined;
    }
    return rankAssigment.usersById.get(userId);
  }, [rankAssigment, userId]);

  const setUserName = useCallback(
    (name: string) => {
      if (name === '') {
        return;
      }
      if (name === user?.name) {
        return;
      }
      const newUser = new User(name);
      rankAssigment.addUser(newUser);
      setUserId(newUser.id);
    },
    [rankAssigment, setUserId, user?.name],
  );

  return [user, setUserName] as const;
}

export function useUser(rankAssignment: RankAssignment) {
  const router = useRouter();
  const { sessionId } = useParams();
  const [user] = useUserState(rankAssignment);
  const pathname = usePathname();
  const isClient = useIsClient();
  useEffect(() => {
    if (!isClient) {
      return;
    }
    if (user) {
      return;
    }
    if (pathname.match(new RegExp('/user/?$'))) {
      return;
    }
    router.push(createRoutePaths(sessionId).user);
  }, [isClient, pathname, router, sessionId, user]);

  return user;
}
