import { Button } from '@/components/ui/button';
import { BuildStateOptions, buildState } from '@/core/mock-factories';
import { State } from '@/core/State';
import { createSession, repo } from '@/lib/repo';
import { MqttClient } from '@/routes/~session/~$documentId/mqtt';
import { NAVIGATOR_ID_KEY } from '@/shared/useNavigator';
import * as Automerge from '@automerge/automerge';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { ulid } from 'ulid';

type Scenario = {
  label: string;
  build: () => State;
  target: '/session/$documentId/ranking' | '/session/$documentId/score';
};

// Items are seeded with stable ids `item-1` … `item-6` (see mock-factories).
// The 1-based index used in the ranking arrays below maps to those ids.
const impactEffortOptions: BuildStateOptions = {
  users: ['Alex', 'Priya', 'Sam'],
  items: [
    /* 1 */ 'Fix OAuth callback 500 in prod',
    /* 2 */ 'Migrate Postgres 14 → 16',
    /* 3 */ 'Add dark mode to settings',
    /* 4 */ 'Reply to SOC2 security questionnaire',
    /* 5 */ 'Refactor billing webhook handler',
    /* 6 */ 'Write onboarding docs for new hires',
  ],
  dimensions: [
    {
      name: 'Impact',
      labelStart: 'Low',
      labelEnd: 'High',
      direction: 'ascending',
    },
    {
      name: 'Effort',
      labelStart: 'Low',
      labelEnd: 'High',
      direction: 'descending',
    },
  ],
  ranked: false,
};

// Per-user rankings. Each array is ordered so position 0 → score 1 on the
// dimension; the score quadrant places score=1 at the top (Y) / left (X).
//   - Impact (ascending):  position 0 = highest score → put HIGHEST impact first
//   - Effort (descending): position 0 = lowest  score → put HIGHEST effort first
//                          (low-effort items end up at the far left of the quadrant,
//                           giving a top-left "quick wins" zone)
//
// Item map: 1 OAuth fix · 2 Postgres migration · 3 dark mode ·
//           4 SOC2 reply · 5 billing refactor · 6 onboarding docs
//
// Canonical placement: 1 OAuth = quick win (top-left), 2/5 = big bets (right),
// 3/6 = nice-to-haves (bottom-left), 4 SOC2 = high-impact, mid-effort.
const userRankingIndexes: [number[], number[]][] = [
  // Alex — canonical
  [
    [1, 4, 2, 5, 6, 3], // Impact: high → low
    [2, 5, 4, 6, 3, 1], // Effort: high → low
  ],
  // Priya — sees Postgres as higher-impact than SOC2; treats onboarding docs as lighter than dark mode
  [
    [1, 2, 4, 5, 6, 3],
    [2, 5, 4, 3, 6, 1],
  ],
  // Sam — pulls billing refactor higher on Impact; thinks SOC2 is heavier than billing
  [
    [1, 4, 5, 2, 6, 3],
    [2, 4, 5, 6, 3, 1],
  ],
];

function buildImpactEffortRanked(): State {
  const base = buildState(impactEffortOptions);
  const [impact, effort] = base.dimensions;
  if (!impact || !effort) throw new Error('expected two dimensions');
  const itemId = (n: number) => `item-${n}`;
  const rankingsByUser: Record<string, Record<string, string[]>> = {};
  base.users.forEach((user, i) => {
    const [impactOrder, effortOrder] = userRankingIndexes[i] ?? [];
    if (!impactOrder || !effortOrder) return;
    rankingsByUser[user.id] = {
      [impact.id]: impactOrder.map(itemId),
      [effort.id]: effortOrder.map(itemId),
    };
  });
  return { ...base, rankingsByUser };
}

const scenarios: Scenario[] = [
  {
    label: 'Impact / Effort — configured (no rankings)',
    build: () => buildState(impactEffortOptions),
    target: '/session/$documentId/ranking',
  },
  {
    label: 'Impact / Effort — complete with score',
    build: buildImpactEffortRanked,
    target: '/session/$documentId/score',
  },
];

export default function DevScenariosPage() {
  const navigate = useNavigate();

  async function seed({ build, target }: Scenario) {
    const state = build();
    const handle = repo.create<State>(state);
    await handle.whenReady();
    const documentId = handle.documentId;

    localStorage.setItem(NAVIGATOR_ID_KEY, JSON.stringify(state.users[0]!.id));

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
