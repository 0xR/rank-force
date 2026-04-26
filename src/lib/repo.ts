import { State } from '@/core/State';
import {
  DocHandle,
  DocumentId,
  Repo,
  stringifyAutomergeUrl,
} from '@automerge/automerge-repo';
import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel';
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb';

export const repo = new Repo({
  storage: new IndexedDBStorageAdapter('rank-force'),
  network:
    import.meta.env.MODE === 'test'
      ? []
      : [new BroadcastChannelNetworkAdapter()],
});

const emptyState: State = {
  items: [],
  dimensions: [],
  users: [],
  rankingsByUser: {},
  dimensionWeights: {},
};

export async function createSession(): Promise<string> {
  const handle = repo.create<State>(emptyState);
  await handle.whenReady();
  return handle.documentId;
}

const SNAPSHOT_RETRY_TIMEOUT_MS = 8_000;
const SNAPSHOT_RETRY_INTERVAL_MS = 500;

async function fetchSnapshotBytes(
  documentId: string,
): Promise<Uint8Array | null> {
  const base = import.meta.env.VITE_SNAPSHOT_URL;
  if (!base) return null;
  const url = `${base}?doc=${encodeURIComponent(documentId)}`;
  const deadline = Date.now() + SNAPSHOT_RETRY_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const res = await fetch(url);
    if (res.status === 200) return new Uint8Array(await res.arrayBuffer());
    if (res.status !== 404) return null;
    await new Promise((r) => setTimeout(r, SNAPSHOT_RETRY_INTERVAL_MS));
  }
  return null;
}

export async function loadDocHandle(
  documentId: string,
): Promise<DocHandle<State>> {
  const url = stringifyAutomergeUrl({ documentId: documentId as DocumentId });
  try {
    return await repo.find<State>(url);
  } catch {
    // Repo couldn't find the doc locally and has no peer to sync from.
    // Cold-start hydrate from the snapshot HTTP endpoint.
    const bytes = await fetchSnapshotBytes(documentId);
    if (!bytes) {
      throw new Error(`Session ${documentId} not found`);
    }
    const handle = repo.import<State>(bytes, {
      docId: documentId as DocumentId,
    });
    // repo.import doesn't transition the handle out of `loading`/`unavailable`.
    // Tell the state machine the doc is now populated so consumers waiting on
    // `whenReady()` (and the React hooks built on it) unblock.
    handle.doneLoading();
    return handle;
  }
}
