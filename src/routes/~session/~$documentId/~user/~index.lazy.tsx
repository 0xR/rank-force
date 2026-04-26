import UserPage from '@/routes/~session/~$documentId/~user/UserPage.tsx';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/session/$documentId/user/')({
  component: () => <UserPage />,
});
