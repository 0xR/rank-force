import { SessionShell } from '@/routes/~session/~$sessionId/Navigation.tsx';
import { userIdStorageKey } from '@/routes/~session/~$sessionId/shared/useUser';
import { getOrCreateSessionDocHandle } from '@/lib/repo';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

const NAVIGATOR_NAME_KEY = 'rank-force-navigator-name';

function readNavigatorName(): string {
  const raw = window.localStorage.getItem(NAVIGATOR_NAME_KEY);
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'string' ? parsed.trim() : '';
  } catch {
    return '';
  }
}

function SessionLayout() {
  return (
    <SessionShell>
      <Outlet />
    </SessionShell>
  );
}

export const Route = createFileRoute('/session/$sessionId')({
  beforeLoad: ({ params: { sessionId }, location }) => {
    const sessionRoot = `/session/${sessionId}`;
    const trimmed = location.pathname.replace(/\/+$/, '');
    if (trimmed !== sessionRoot) return;

    const userId = window.localStorage.getItem(userIdStorageKey(sessionId));
    if (userId) {
      throw redirect({
        to: '/session/$sessionId/ranking',
        params: { sessionId },
      });
    }
    const navigatorName = readNavigatorName();
    throw redirect({
      to: navigatorName
        ? '/session/$sessionId/configure'
        : '/session/$sessionId/user',
      params: { sessionId },
    });
  },
  loader: async ({ params }) => {
    const handle = await getOrCreateSessionDocHandle(params.sessionId);
    return { docUrl: handle.url };
  },
  pendingComponent: () => <div className="p-5">Loading session…</div>,
  component: SessionLayout,
});
