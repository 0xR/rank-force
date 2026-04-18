import { Ranking } from '@/routes/~session/~$sessionId/~ranking/Ranking.tsx';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/session/$sessionId/ranking/')({
  component: () => <Ranking />,
});
