import { Configure } from '@/routes/~session/~$documentId/~configure/Configure.tsx';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/session/$documentId/configure/')({
  component: Configure,
});
