import { Ranking } from '@/routes/~session/~$documentId/~ranking/Ranking.tsx';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/session/$documentId/ranking/')({
  component: () => <Ranking />,
});
