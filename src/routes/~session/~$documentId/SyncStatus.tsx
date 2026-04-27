import { cn } from '@/lib/utils';
import { useSyncStatus } from '@/routes/~session/~$documentId/useSyncStatus';
import type {
  SyncState,
  SyncStatusSnapshot,
} from '@/routes/~session/~$documentId/syncStatus';

const labels: Record<SyncState, string> = {
  live: 'Live',
  syncing: 'Syncing…',
  offline: 'Offline',
};

const dotClass: Record<SyncState, string> = {
  live: 'bg-cyan',
  syncing: 'bg-cyan',
  offline: 'bg-space-5',
};

function tooltip({ status, pending }: SyncStatusSnapshot): string {
  if (status === 'live') return 'Connected. All changes synced.';
  if (status === 'syncing') {
    const noun = pending === 1 ? 'change' : 'changes';
    return `Connected. ${pending} ${noun} pending.`;
  }
  return 'Offline. Local changes are saved and will sync when you reconnect.';
}

export function SyncStatus() {
  const snapshot = useSyncStatus();
  const { status } = snapshot;
  return (
    <span
      role="status"
      aria-label={`Sync status: ${labels[status]}`}
      title={tooltip(snapshot)}
      className="inline-flex items-center justify-center h-9 w-6"
    >
      <span
        className={cn(
          'h-1.5 w-1.5 rounded-full transition-colors duration-150 ease-out-quart',
          dotClass[status],
          status === 'syncing' && 'animate-pulse',
        )}
      />
    </span>
  );
}
