import { createLazyFileRoute, Navigate } from '@tanstack/react-router';

const SessionIdRoot = () => {
  const sessionId = Route.useParams({
    select: (p) => p.sessionId,
  });
  return <Navigate to="/session/$sessionId/ranking" params={{ sessionId }} />;
};

export const Route = createLazyFileRoute('/session/$sessionId/')({
  component: SessionIdRoot,
});
