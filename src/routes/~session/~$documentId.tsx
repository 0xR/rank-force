import { State } from '@/core/State';
import { SessionShell } from '@/routes/~session/~$documentId/Navigation.tsx';
import { useUserId } from '@/routes/~session/~$documentId/shared/useUser';
import { useSyncBridge } from '@/routes/~session/~$documentId/useSyncBridge';
import { loadDocHandle } from '@/lib/repo';
import { NAVIGATOR_NAME_KEY } from '@/shared/useNavigator';
import { DocHandle, DocumentId } from '@automerge/automerge-repo';
import { useDocHandle } from '@automerge/automerge-repo-react-hooks';
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';

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

function SyncBridgeMount() {
  const { documentId } = Route.useParams();
  const [userId] = useUserId();
  const handle = useDocHandle<State>(documentId as DocumentId, {
    suspense: false,
  });
  if (!handle || !userId) return null;
  return (
    <ActiveSyncBridge handle={handle} documentId={documentId} userId={userId} />
  );
}

function ActiveSyncBridge({
  handle,
  documentId,
  userId,
}: {
  handle: DocHandle<State>;
  documentId: string;
  userId: string;
}) {
  useSyncBridge(handle, documentId, userId);
  return null;
}

function SessionLayout() {
  return (
    <SessionShell>
      <SyncBridgeMount />
      <Outlet />
    </SessionShell>
  );
}

export const Route = createFileRoute('/session/$documentId')({
  beforeLoad: ({ params: { documentId }, location }) => {
    const sessionRoot = `/session/${documentId}`;
    const trimmed = location.pathname.replace(/\/+$/, '');
    if (trimmed !== sessionRoot) return;

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
