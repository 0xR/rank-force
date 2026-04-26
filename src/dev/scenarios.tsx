import { Button } from '@/components/ui/button';
import { BuildStateOptions, buildState } from '@/core/mock-factories';
import { State } from '@/core/State';
import { createSession, repo } from '@/lib/repo';
import { MqttClient } from '@/routes/~session/~$documentId/mqtt';
import * as Automerge from '@automerge/automerge';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ulid } from 'ulid';

type Scenario = {
  label: string;
  options: BuildStateOptions;
  target: '/session/$documentId/ranking' | '/session/$documentId/score';
};

const scenarios: Scenario[] = [
  {
    label: 'Configured (no rankings)',
    options: { users: 3, items: 4, dimensions: 2, ranked: false },
    target: '/session/$documentId/ranking',
  },
  {
    label: 'Complete with score',
    options: { users: 3, items: 4, dimensions: 2, ranked: true },
    target: '/session/$documentId/score',
  },
];

const userIdKey = (documentId: string) => `rank-force-${documentId}-userid`;

export default function DevScenariosPage() {
  const navigate = useNavigate();

  async function seed({ options, target }: Scenario) {
    const state = buildState(options);
    const handle = repo.create<State>(state);
    await handle.whenReady();
    const documentId = handle.documentId;

    localStorage.setItem(
      userIdKey(documentId),
      JSON.stringify(state.users[0]!.id),
    );

    await navigate({ to: target, params: { documentId } });
  }

  return (
    <div className="mx-auto max-w-xl space-y-4 p-8">
      <h1 className="text-2xl font-semibold">Dev seed</h1>
      <p className="text-sm text-space-6">
        Each click wipes the dev session and re-seeds it.
      </p>
      <div className="flex flex-col gap-2">
        {scenarios.map((scenario) => (
          <Button
            key={scenario.label}
            variant="outline"
            onClick={() => seed(scenario)}
          >
            {scenario.label}
          </Button>
        ))}
      </div>

      <PersisterRoundTrip />
    </div>
  );
}

function PersisterRoundTrip() {
  const [log, setLog] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const append = (line: string) =>
    setLog((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);

  async function run() {
    setBusy(true);
    setLog([]);
    let client: MqttClient | undefined;
    try {
      const documentId = await createSession();
      append(`documentId=${documentId}`);

      const empty = Automerge.from<State>({
        items: [],
        dimensions: [],
        users: [],
        rankingsByUser: {},
        dimensionWeights: {},
      });
      const label = `dev-${new Date().toISOString()}`;
      const after = Automerge.change(empty, (d) => {
        d.items.push({ id: 'dev-item', label });
      });
      const changes = Automerge.getAllChanges(after);
      append(`built ${changes.length} change(s)`);

      client = new MqttClient({ documentId, userId: ulid() });
      append(`connecting…`);
      for (const change of changes) {
        await client.publish(change);
      }
      append(`published ${changes.length} change(s)`);

      const snapshotUrl = import.meta.env.VITE_SNAPSHOT_URL;
      if (!snapshotUrl) throw new Error('VITE_SNAPSHOT_URL is not set');
      const fullUrl = `${snapshotUrl}?doc=${encodeURIComponent(documentId)}`;
      for (let attempt = 0; attempt < 6; attempt++) {
        await new Promise((r) => setTimeout(r, 750));
        const res = await fetch(fullUrl);
        if (res.status === 200) {
          const buf = new Uint8Array(await res.arrayBuffer());
          append(`snapshot bytes: ${buf.length}`);
          const doc = Automerge.load<State>(buf);
          append(`doc keys: ${JSON.stringify(Object.keys(doc))}`);
          const items = doc.items ?? [];
          append(
            `snapshot ok: items=${JSON.stringify(items.map((i) => i.label))}`,
          );
          return;
        }
        append(`attempt ${attempt + 1}: ${res.status}`);
      }
      append('gave up waiting for snapshot');
    } catch (err) {
      console.error('round-trip failed:', err);
      const message = err instanceof Error ? err.message : String(err);
      append(`error: ${message}`);
      if (err instanceof Error && err.stack) {
        append(err.stack);
      }
    } finally {
      try {
        await client?.close();
      } catch {
        // ignore
      }
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2 border-t border-space-3 pt-4">
      <h2 className="text-lg font-semibold">Persister round-trip</h2>
      <p className="text-sm text-space-6">
        Creates a session, publishes a real Automerge change over MQTT, then
        polls the snapshot URL until DDB has the doc.
      </p>
      <Button variant="outline" disabled={busy} onClick={run}>
        {busy ? 'Running…' : 'Run round-trip'}
      </Button>
      {log.length > 0 && (
        <pre className="text-xs bg-space-1 border border-space-3 rounded p-3 overflow-auto whitespace-pre-wrap">
          {log.join('\n')}
        </pre>
      )}
    </div>
  );
}
