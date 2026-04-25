import { SessionShell } from '@/routes/~session/~$sessionId/Navigation.tsx';
import { getOrCreateSessionDocHandle } from '@/lib/repo';
import { createFileRoute, Outlet } from '@tanstack/react-router';

function SessionLayout() {
  return (
    <SessionShell>
      <Outlet />
    </SessionShell>
  );
}

export const Route = createFileRoute('/session/$sessionId')({
  loader: async ({ params }) => {
    const handle = await getOrCreateSessionDocHandle(params.sessionId);
    return { docUrl: handle.url };
  },
  pendingComponent: () => <div className="p-5">Loading session…</div>,
  component: SessionLayout,
});
