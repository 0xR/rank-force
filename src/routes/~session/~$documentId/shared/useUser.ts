import { RankAssignment } from '@/core/RankAssignment';
import { User } from '@/core/User';
import { Route } from '@/routes/~session/~$documentId.tsx';
import {
  NAVIGATOR_ID_KEY,
  useNavigatorId,
  useNavigatorName,
} from '@/shared/useNavigator';
import { useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';

export const navigatorIdStorageKey = NAVIGATOR_ID_KEY;

export function useUserId() {
  const id = useNavigatorId();
  return [id] as const;
}

export function useUserState(rankAssigment: RankAssignment) {
  const userId = useNavigatorId();

  const user = useMemo(
    () => rankAssigment.usersById.get(userId),
    [rankAssigment, userId],
  );

  const setUserName = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const existing = rankAssigment.usersById.get(userId);
      if (existing) {
        if (existing.name === trimmed) return;
        rankAssigment.renameUser(userId, trimmed);
        return;
      }
      rankAssigment.addUser(User.make(trimmed, userId));
    },
    [rankAssigment, userId],
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
