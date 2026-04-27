export type SyncState = 'live' | 'syncing' | 'offline';

export type SyncStatusSnapshot = {
  status: SyncState;
  pending: number;
};

const OFFLINE: SyncStatusSnapshot = { status: 'offline', pending: 0 };

let snapshot: SyncStatusSnapshot = OFFLINE;
const listeners = new Set<() => void>();

export function getSyncStatusSnapshot(): SyncStatusSnapshot {
  return snapshot;
}

export function setSyncStatus(next: SyncStatusSnapshot): void {
  if (next.status === snapshot.status && next.pending === snapshot.pending) {
    return;
  }
  snapshot = next;
  for (const listener of listeners) listener();
}

export function subscribeSyncStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetSyncStatus(): void {
  snapshot = OFFLINE;
}
