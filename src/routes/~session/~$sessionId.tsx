import { NavigationMenuDemo } from '@/routes/~session/~$sessionId/Navigation.tsx';
import { getOrCreateSessionDocHandle } from '@/lib/repo';
import { createFileRoute, Outlet } from '@tanstack/react-router';

function SessionLayout() {
  return (
    <>
      <NavigationMenuDemo />
      <div className="flex flex-col gap-5 bg-gray-100 max-w-7xl mx-auto p-5">
        <Outlet />
      </div>
    </>
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
