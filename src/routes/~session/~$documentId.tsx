import { SessionShell } from '@/routes/~session/~$documentId/Navigation.tsx';
import { userIdStorageKey } from '@/routes/~session/~$documentId/shared/useUser';
import { loadDocHandle } from '@/lib/repo';
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

export const Route = createFileRoute('/session/$documentId')({
  beforeLoad: ({ params: { documentId }, location }) => {
    const sessionRoot = `/session/${documentId}`;
    const trimmed = location.pathname.replace(/\/+$/, '');
    if (trimmed !== sessionRoot) return;

    const userId = window.localStorage.getItem(userIdStorageKey(documentId));
    if (userId) {
      throw redirect({
        to: '/session/$documentId/ranking',
        params: { documentId },
      });
    }
    const navigatorName = readNavigatorName();
    throw redirect({
      to: navigatorName
        ? '/session/$documentId/configure'
        : '/session/$documentId/user',
      params: { documentId },
    });
  },
  loader: async ({ params }) => {
    const handle = await loadDocHandle(params.documentId);
    return { docUrl: handle.url };
  },
  pendingComponent: () => <div className="p-5">Loading session…</div>,
  component: SessionLayout,
});
