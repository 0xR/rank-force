import { userIdStorageKey } from '@/routes/~session/~$sessionId/shared/useUser';
import { createLazyFileRoute, Navigate } from '@tanstack/react-router';

const SessionIdRoot = () => {
  const sessionId = Route.useParams({
    select: (p) => p.sessionId,
  });
  const userId = window.localStorage.getItem(userIdStorageKey(sessionId));
  const to = userId
    ? '/session/$sessionId/ranking'
    : '/session/$sessionId/user';
  return <Navigate to={to} params={{ sessionId }} />;
};

export const Route = createLazyFileRoute('/session/$sessionId/')({
  component: SessionIdRoot,
});
