import { Score } from '@/routes/~session/~$sessionId/~score/Score.tsx';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/session/$sessionId/score/')({
  component: Score,
});
