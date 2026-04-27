import { State } from '@/core/State';
import { MqttClient } from '@/routes/~session/~$documentId/mqtt';
import { setSyncStatus } from '@/routes/~session/~$documentId/syncStatus';
import { MqttToken } from '@/shared/MqttToken';
import * as Automerge from '@automerge/automerge';
import { DocHandle } from '@automerge/automerge-repo';
import { useEffect } from 'react';

export type SyncBridgeClient = {
  subscribe(): Promise<void>;
  publish(bytes: Uint8Array): Promise<void>;
  onMessage(callback: (bytes: Uint8Array) => void): void;
  onStatus(callback: (state: 'connected' | 'disconnected') => void): void;
  close(): Promise<void>;
};

type SyncBridgeOptions = {
  createClient?: (token: MqttToken) => SyncBridgeClient;
  fetchSnapshot?: (documentId: string) => Promise<Uint8Array | null>;
};

const defaultCreateClient = (token: MqttToken): SyncBridgeClient =>
  new MqttClient(token);

async function defaultFetchSnapshot(
  documentId: string,
): Promise<Uint8Array | null> {
  const base = import.meta.env.VITE_SNAPSHOT_URL;
  if (!base) return null;
  const res = await fetch(`${base}?doc=${encodeURIComponent(documentId)}`);
  if (!res.ok) return null;
  return new Uint8Array(await res.arrayBuffer());
}

export function useSyncBridge(
  handle: DocHandle<State>,
  documentId: string,
  userId: string,
  options?: SyncBridgeOptions,
): void {
  const createClient = options?.createClient ?? defaultCreateClient;
  const fetchSnapshot = options?.fetchSnapshot ?? defaultFetchSnapshot;

  useEffect(() => {
    let mounted = true;
    let connected = false;
    let pending = 0;

    const emitStatus = () => {
      if (!mounted) return;
      const status = !connected ? 'offline' : pending > 0 ? 'syncing' : 'live';
      setSyncStatus({ status, pending });
    };

    const client = createClient({ documentId, userId });

    client.onStatus((state) => {
      connected = state === 'connected';
      emitStatus();
    });

    client.onMessage((bytes) => {
      if (!mounted) return;
      handle.update((doc) => Automerge.applyChanges(doc, [bytes])[0]);
    });

    const trackedPublish = async (bytes: Uint8Array) => {
      pending += 1;
      emitStatus();
      try {
        await client.publish(bytes);
      } finally {
        pending = Math.max(0, pending - 1);
        emitStatus();
      }
    };

    const onChange = ({
      patchInfo,
    }: {
      patchInfo: Automerge.PatchInfo<State>;
    }) => {
      if (!mounted) return;
      const newChanges = Automerge.getChanges(
        patchInfo.before,
        patchInfo.after,
      );
      for (const change of newChanges) {
        void trackedPublish(change);
      }
    };
    handle.on('change', onChange);

    void (async () => {
      try {
        await client.subscribe();
        // Bootstrap: the persister builds the snapshot incrementally from
        // change bytes only — it never sees a doc's initial-state change
        // unless someone publishes it. Push every change we already have
        // so a fresh persister can reconstruct the full history. Idempotent
        // at the persister (same change hashes → same save bytes).
        const initialChanges = Automerge.getAllChanges(handle.doc());
        for (const change of initialChanges) {
          if (!mounted) return;
          await trackedPublish(change);
        }
        const snapshot = await fetchSnapshot(documentId);
        if (!mounted || !snapshot) return;
        handle.update((doc) => Automerge.loadIncremental(doc, snapshot));
      } catch (err) {
        console.error('sync bridge init failed', err);
      }
    })();

    return () => {
      mounted = false;
      handle.off('change', onChange);
      void client.close();
      setSyncStatus({ status: 'offline', pending: 0 });
    };
  }, [handle, documentId, userId, createClient, fetchSnapshot]);
}
