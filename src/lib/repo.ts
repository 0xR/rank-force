import { State } from '@/core/State';
import {
  AutomergeUrl,
  DocHandle,
  isValidAutomergeUrl,
  Repo,
} from '@automerge/automerge-repo';
import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel';
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb';

export const repo = new Repo({
  storage: new IndexedDBStorageAdapter('rank-force'),
  network: [new BroadcastChannelNetworkAdapter()],
});

function sessionUrlKey(sessionId: string) {
  return `rank-force-${sessionId}-doc-url`;
}

const emptyState: State = {
  items: [],
  dimensions: [],
  users: [],
  rankingsByUser: {},
  dimensionWeights: {},
};

export async function getOrCreateSessionDocHandle(
  sessionId: string,
): Promise<DocHandle<State>> {
  const stored = localStorage.getItem(sessionUrlKey(sessionId));
  if (stored && isValidAutomergeUrl(stored)) {
    return repo.find<State>(stored);
  }
  const handle = repo.create<State>(emptyState);
  localStorage.setItem(sessionUrlKey(sessionId), handle.url);
  await handle.whenReady();
  return handle;
}

export type SessionDocUrl = AutomergeUrl;
