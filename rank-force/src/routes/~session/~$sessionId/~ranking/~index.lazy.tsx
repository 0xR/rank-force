import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/session/$sessionId/ranking/')({
  component: () => <div>hello index.lazy</div>,
});
