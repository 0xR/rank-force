import { State } from '@/core/State';
import { repo } from '@/lib/repo';
import {
  SyncBridgeClient,
  useSyncBridge,
} from '@/routes/~session/~$documentId/useSyncBridge';
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
  private listeners: ((bytes: Uint8Array) => void)[] = [];

  constructor(token: MqttToken) {
    this.token = token;
    FakeMqttClient.lastInstance = this;
  }

  async subscribe() {
    this.subscribed = true;
  }

  async publish(bytes: Uint8Array) {
    this.published.push(bytes);
  }

  onMessage(callback: (bytes: Uint8Array) => void) {
    this.listeners.push(callback);
  }

  async close() {
    this.closed = true;
  }

  emitInbound(bytes: Uint8Array) {
    for (const listener of this.listeners) listener(bytes);
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

    // Simulate a peer that loaded the same doc, made a change, and pushed
    // the change bytes via MQTT. We fork by save+load to get a divergent
    // actor whose change descends from the same heads.
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

    // Clear any publishes triggered by the snapshot/inbound init phase.
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

    // Snapshot is built as a peer's view of the same doc with one extra
    // change applied — i.e. a fork of the local handle's doc.
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
});
