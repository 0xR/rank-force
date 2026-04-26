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

export async function loadDocHandle(
  documentId: string,
): Promise<DocHandle<State>> {
  return repo.find<State>(
    stringifyAutomergeUrl({ documentId: documentId as DocumentId }),
  );
}
