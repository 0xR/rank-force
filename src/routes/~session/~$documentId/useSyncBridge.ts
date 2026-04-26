import { State } from '@/core/State';
import { MqttClient } from '@/routes/~session/~$documentId/mqtt';
import { MqttToken } from '@/shared/MqttToken';
import * as Automerge from '@automerge/automerge';
import { DocHandle } from '@automerge/automerge-repo';
import { useEffect } from 'react';

export type SyncBridgeClient = {
  subscribe(): Promise<void>;
  publish(bytes: Uint8Array): Promise<void>;
  onMessage(callback: (bytes: Uint8Array) => void): void;
  close(): Promise<void>;
};

export type SyncBridgeOptions = {
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
    const client = createClient({ documentId, userId });

    client.onMessage((bytes) => {
      if (!mounted) return;
      handle.update((doc) => Automerge.applyChanges(doc, [bytes])[0]);
    });

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
        void client.publish(change);
      }
    };
    handle.on('change', onChange);

    void (async () => {
      try {
        await client.subscribe();
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
    };
  }, [handle, documentId, userId, createClient, fetchSnapshot]);
}
