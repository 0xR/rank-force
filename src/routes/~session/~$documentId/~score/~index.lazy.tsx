import { Score } from '@/routes/~session/~$documentId/~score/Score.tsx';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/session/$documentId/score/')({
  component: Score,
});
