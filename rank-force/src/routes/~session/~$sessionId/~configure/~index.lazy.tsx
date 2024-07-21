import { Configure } from '@/routes/~session/~$sessionId/~configure/Configure.tsx';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/session/$sessionId/configure/')({
  component: Configure,
});
