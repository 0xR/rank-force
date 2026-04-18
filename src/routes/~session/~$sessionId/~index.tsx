import { userIdStorageKey } from '@/routes/~session/~$sessionId/shared/useUser';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/session/$sessionId/')({
  beforeLoad: ({ params: { sessionId } }) => {
    const userId = window.localStorage.getItem(userIdStorageKey(sessionId));
    throw redirect({
      to: userId
        ? '/session/$sessionId/ranking'
        : '/session/$sessionId/user',
      params: { sessionId },
    });
  },
});
