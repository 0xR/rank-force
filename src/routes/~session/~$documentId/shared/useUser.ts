import { RankAssignment } from '@/core/RankAssignment';
import { User } from '@/core/User';
import { Route } from '@/routes/~session/~$documentId.tsx';
import { useNavigatorName } from '@/shared/useNavigator';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export function userIdStorageKey(documentId: string) {
  return `rank-force-${documentId}-userid`;
}

export function useUserId() {
  const { documentId } = Route.useParams();
  return useLocalStorage<string | null>(userIdStorageKey(documentId), null);
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
  const { documentId } = Route.useParams();
  const [user, setUserName] = useUserState(rankAssignment);
  const [navigatorName] = useNavigatorName();
  const navigate = useNavigate();

  // Stable refs so the effect can run exactly once per "bootstrap intent"
  // without resubscribing on every re-render of setUserName / navigate.
  const setUserNameRef = useRef(setUserName);
  setUserNameRef.current = setUserName;
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const bootstrappedFor = useRef<string | null>(null);

  useEffect(() => {
    if (user) {
      bootstrappedFor.current = null;
      return;
    }
    const name = navigatorName.trim();
    if (name) {
      if (bootstrappedFor.current === name) return;
      bootstrappedFor.current = name;
      setUserNameRef.current(name);
      return;
    }
    navigateRef.current({
      to: '/session/$documentId/user',
      params: { documentId },
    });
  }, [navigatorName, documentId, user]);

  return user;
}
