import { State } from '@/core/State';
import { repo } from '@/lib/repo';
import {
  SyncBridgeClient,
  useSyncBridge,
} from '@/routes/~session/~$documentId/useSyncBridge';
import {
  getSyncStatusSnapshot,
  resetSyncStatus,
} from '@/routes/~session/~$documentId/syncStatus';
import { MqttToken } from '@/shared/MqttToken';
import * as Automerge from '@automerge/automerge';
import { DocHandle } from '@automerge/automerge-repo';
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const emptyState: State = {
  items: [],
  dimensions: [],
  users: [],
  rankingsByUser: {},
  dimensionWeights: {},
};

class FakeMqttClient implements SyncBridgeClient {
  static lastInstance: FakeMqttClient | undefined;
  readonly token: MqttToken;
  published: Uint8Array[] = [];
  closed = false;
  subscribed = false;
  holdPublishes = false;
  private listeners: ((bytes: Uint8Array) => void)[] = [];
  private statusListeners: ((s: 'connected' | 'disconnected') => void)[] = [];
  private pendingPublishResolvers: Array<() => void> = [];

  constructor(token: MqttToken) {
    this.token = token;
    FakeMqttClient.lastInstance = this;
  }

  async subscribe() {
    this.subscribed = true;
  }

  async publish(bytes: Uint8Array) {
    this.published.push(bytes);
    if (!this.holdPublishes) return;
    return new Promise<void>((resolve) => {
      this.pendingPublishResolvers.push(resolve);
    });
  }

  onMessage(callback: (bytes: Uint8Array) => void) {
    this.listeners.push(callback);
  }

  onStatus(callback: (state: 'connected' | 'disconnected') => void) {
    this.statusListeners.push(callback);
  }

  async close() {
    this.closed = true;
  }

  emitInbound(bytes: Uint8Array) {
    for (const listener of this.listeners) listener(bytes);
  }

  emitStatus(state: 'connected' | 'disconnected') {
    for (const listener of this.statusListeners) listener(state);
  }

  resolveAllPublishes() {
    const resolvers = this.pendingPublishResolvers;
    this.pendingPublishResolvers = [];
    for (const r of resolvers) r();
  }
}

async function flush() {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
}

async function makeHandle(): Promise<DocHandle<State>> {
  const handle = repo.create<State>(emptyState);
  await handle.whenReady();
  return handle;
}

describe('useSyncBridge', () => {
  beforeEach(() => {
    FakeMqttClient.lastInstance = undefined;
    resetSyncStatus();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('builds a client scoped to the given documentId and userId', async () => {
    const handle = await makeHandle();
    const createClient = vi.fn((token: MqttToken) => new FakeMqttClient(token));

    renderHook(() =>
      useSyncBridge(handle, handle.documentId, 'user-1', {
        createClient,
        fetchSnapshot: async () => null,
      }),
    );
    await flush();

    expect(createClient).toHaveBeenCalledWith({
      documentId: handle.documentId,
      userId: 'user-1',
    });
    expect(FakeMqttClient.lastInstance?.subscribed).toBe(true);
  });

  it('applies inbound MQTT bytes to the doc via handle.update', async () => {
    const handle = await makeHandle();

    renderHook(() =>
      useSyncBridge(handle, handle.documentId, 'user-1', {
        createClient: (token) => new FakeMqttClient(token),
        fetchSnapshot: async () => null,
      }),
    );
    await flush();

    const fork = Automerge.load<State>(Automerge.save(handle.doc()!));
    const next = Automerge.change(fork, (d) => {
      d.dimensionWeights['x'] = 0.7;
    });
    const [changeBytes] = Automerge.getChanges(fork, next);

    await act(async () => {
      FakeMqttClient.lastInstance!.emitInbound(changeBytes!);
      await Promise.resolve();
    });

    expect(handle.doc()!.dimensionWeights).toEqual({ x: 0.7 });
  });

  it('forwards local doc changes to client.publish', async () => {
    const handle = await makeHandle();

    renderHook(() =>
      useSyncBridge(handle, handle.documentId, 'user-1', {
        createClient: (token) => new FakeMqttClient(token),
        fetchSnapshot: async () => null,
      }),
    );
    await flush();

    FakeMqttClient.lastInstance!.published = [];

    await act(async () => {
      handle.change((d) => {
        d.dimensionWeights['y'] = 0.4;
      });
      await Promise.resolve();
    });

    expect(FakeMqttClient.lastInstance!.published.length).toBeGreaterThan(0);
  });

  it('merges a fetched snapshot into the doc', async () => {
    const handle = await makeHandle();

    const fork = Automerge.load<State>(Automerge.save(handle.doc()!));
    const snapshotDoc = Automerge.change(fork, (d) => {
      d.dimensionWeights['from-snapshot'] = 0.9;
    });
    const snapshotBytes = Automerge.save(snapshotDoc);

    renderHook(() =>
      useSyncBridge(handle, handle.documentId, 'user-1', {
        createClient: (token) => new FakeMqttClient(token),
        fetchSnapshot: async () => snapshotBytes,
      }),
    );
    await flush();
    await flush();

    expect(handle.doc()!.dimensionWeights).toEqual({ 'from-snapshot': 0.9 });
  });

  it('closes the client on unmount', async () => {
    const handle = await makeHandle();

    const { unmount } = renderHook(() =>
      useSyncBridge(handle, handle.documentId, 'user-1', {
        createClient: (token) => new FakeMqttClient(token),
        fetchSnapshot: async () => null,
      }),
    );
    await flush();

    const client = FakeMqttClient.lastInstance!;
    expect(client.closed).toBe(false);

    unmount();
    await flush();

    expect(client.closed).toBe(true);
  });

  it('flips sync status to live when the client emits connected', async () => {
    const handle = await makeHandle();

    renderHook(() =>
      useSyncBridge(handle, handle.documentId, 'user-1', {
        createClient: (token) => new FakeMqttClient(token),
        fetchSnapshot: async () => null,
      }),
    );
    await flush();

    expect(getSyncStatusSnapshot().status).toBe('offline');

    await act(async () => {
      FakeMqttClient.lastInstance!.emitStatus('connected');
      await Promise.resolve();
    });
    await flush();

    expect(getSyncStatusSnapshot().status).toBe('live');
  });

  it('reports syncing while a publish is in flight, then live', async () => {
    const handle = await makeHandle();

    const client = new FakeMqttClient({
      documentId: handle.documentId,
      userId: 'user-1',
    });
    client.holdPublishes = true;

    renderHook(() =>
      useSyncBridge(handle, handle.documentId, 'user-1', {
        createClient: () => client,
        fetchSnapshot: async () => null,
      }),
    );
    await flush();

    await act(async () => {
      client.emitStatus('connected');
      await Promise.resolve();
    });
    // Drain any bootstrap publishes triggered by getAllChanges.
    await act(async () => {
      client.resolveAllPublishes();
      await Promise.resolve();
    });
    await flush();

    expect(getSyncStatusSnapshot().status).toBe('live');

    await act(async () => {
      handle.change((d) => {
        d.dimensionWeights['z'] = 0.5;
      });
      await Promise.resolve();
    });

    expect(getSyncStatusSnapshot().status).toBe('syncing');
    expect(getSyncStatusSnapshot().pending).toBeGreaterThan(0);

    await act(async () => {
      client.resolveAllPublishes();
      await Promise.resolve();
    });
    await flush();

    expect(getSyncStatusSnapshot().status).toBe('live');
    expect(getSyncStatusSnapshot().pending).toBe(0);
  });

  it('returns to offline when the client emits disconnected', async () => {
    const handle = await makeHandle();

    renderHook(() =>
      useSyncBridge(handle, handle.documentId, 'user-1', {
        createClient: (token) => new FakeMqttClient(token),
        fetchSnapshot: async () => null,
      }),
    );
    await flush();

    await act(async () => {
      FakeMqttClient.lastInstance!.emitStatus('connected');
      await Promise.resolve();
    });
    await flush();
    expect(getSyncStatusSnapshot().status).toBe('live');

    await act(async () => {
      FakeMqttClient.lastInstance!.emitStatus('disconnected');
      await Promise.resolve();
    });
    await flush();

    expect(getSyncStatusSnapshot().status).toBe('offline');
  });

  it('resets sync status to offline on unmount', async () => {
    const handle = await makeHandle();

    const { unmount } = renderHook(() =>
      useSyncBridge(handle, handle.documentId, 'user-1', {
        createClient: (token) => new FakeMqttClient(token),
        fetchSnapshot: async () => null,
      }),
    );
    await flush();

    await act(async () => {
      FakeMqttClient.lastInstance!.emitStatus('connected');
      await Promise.resolve();
    });
    await flush();
    expect(getSyncStatusSnapshot().status).toBe('live');

    unmount();
    await flush();

    expect(getSyncStatusSnapshot()).toEqual({ status: 'offline', pending: 0 });
  });
});
