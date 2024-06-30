import UserPage from '@/routes/~session/~$sessionId/~user/UserPage.tsx';
import { createLazyFileRoute } from '@tanstack/react-router';

export const Route = createLazyFileRoute('/session/$sessionId/user/')({
  component: () => <UserPage />,
});
