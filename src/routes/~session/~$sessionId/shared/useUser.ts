import { RankAssignment } from '@/core/RankAssignment';
import { User } from '@/core/User';
import { Route } from '@/routes/~session/~$sessionId.tsx';
import { useChildMatches, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export function userIdStorageKey(sessionId: string) {
  return `rank-force-${sessionId}-userid`;
}

export function useUserId() {
  const { sessionId } = Route.useParams();
  return useLocalStorage<string | null>(userIdStorageKey(sessionId), null);
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
      const newUser = User.make(name);
      rankAssigment.addUser(newUser);
      setUserId(newUser.id);
    },
    [rankAssigment, setUserId, user?.name],
  );

  return [user, setUserName] as const;
}

export function useUser(rankAssignment: RankAssignment) {
  const { sessionId } = Route.useParams();
  const [user] = useUserState(rankAssignment);
  const childMatches = useChildMatches();
  const navigate = useNavigate();
  useEffect(() => {
    console.log('useUser', sessionId, childMatches, user);
    if (user) {
      return;
    }
    // if (childMatches) {
    //   return;
    // }return
    navigate({
      to: '/session/$sessionId/user',
      params: {
        sessionId,
      },
    });
    console.log('useUser', sessionId, childMatches, user);
  }, [childMatches, navigate, sessionId, user]);

  return user;
}
