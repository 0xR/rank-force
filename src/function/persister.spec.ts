import { State } from '@/core/State';
import * as Automerge from '@automerge/automerge';
import { describe, expect, it } from 'vitest';

import {
  ConditionalCheckFailedError,
  DdbPort,
  SnapshotRecord,
  persistChange,
} from './persister';

const emptyState: State = {
  items: [],
  dimensions: [],
  users: [],
  rankingsByUser: {},
  dimensionWeights: {},
};

class FakeDdb implements DdbPort {
  records = new Map<string, SnapshotRecord>();
  putCalls: SnapshotRecord[] = [];
  /** Inject an interleaved writer's record on the next put, then throw CCFE. */
  raceOnNextPut?: SnapshotRecord;

  async get(pk: string, sk: string): Promise<SnapshotRecord | undefined> {
    return this.records.get(`${pk}|${sk}`);
  }

  async put(record: SnapshotRecord, expectedVersion: number): Promise<void> {
    this.putCalls.push(record);
    if (this.raceOnNextPut) {
      const winner = this.raceOnNextPut;
      this.raceOnNextPut = undefined;
      this.records.set(`${winner.pk}|${winner.sk}`, winner);
      throw new ConditionalCheckFailedError();
    }
    const key = `${record.pk}|${record.sk}`;
    const existing = this.records.get(key);
    const actualVersion = existing?.version ?? 0;
    if (actualVersion !== expectedVersion) {
      throw new ConditionalCheckFailedError();
    }
    this.records.set(key, record);
  }
}

function buildClientHistory(...mutators: Array<(d: State) => void>): {
  changes: Uint8Array[];
} {
  let doc = Automerge.from<State>(emptyState);
  for (const m of mutators) {
    doc = Automerge.change(doc, m);
  }
  return { changes: Automerge.getAllChanges(doc) };
}

describe('persistChange', () => {
  it('retries once when a concurrent writer wins the conditional put', async () => {
    const ddb = new FakeDdb();
    const { changes: bootstrap } = buildClientHistory((d) => {
      d.items.push({ id: 'x', label: 'first' });
    });
    for (const change of bootstrap) {
      await persistChange(ddb, 'docABC', change);
    }
    const baseRecord = ddb.records.get('doc#docABC|snapshot')!;
    const baseVersion = baseRecord.version;
    ddb.putCalls = [];

    const baseDocB = Automerge.load<State>(baseRecord.binary);
    const writerB = Automerge.change(baseDocB, (d) => {
      d.items.push({ id: 'b', label: 'B' });
    });
    const winningRecord: SnapshotRecord = {
      pk: 'doc#docABC',
      sk: 'snapshot',
      binary: Automerge.save(writerB),
      version: baseVersion + 1,
    };
    ddb.raceOnNextPut = winningRecord;

    const baseDocA = Automerge.load<State>(baseRecord.binary);
    const writerA = Automerge.change(baseDocA, (d) => {
      d.items.push({ id: 'a', label: 'A' });
    });
    const [aChange] = Automerge.getChanges(baseDocA, writerA);

    await persistChange(ddb, 'docABC', aChange!);

    expect(ddb.putCalls).toHaveLength(2);
    const final = ddb.records.get('doc#docABC|snapshot')!;
    expect(final.version).toBe(baseVersion + 2);
    const merged = Automerge.load<State>(final.binary);
    expect(merged.items.map((i) => i.label).sort()).toEqual([
      'A',
      'B',
      'first',
    ]);
  });

  it('does not put when re-applying a change already in the snapshot', async () => {
    const ddb = new FakeDdb();
    const { changes } = buildClientHistory((d) => {
      d.items.push({ id: 'x', label: 'first' });
    });
    for (const change of changes) {
      await persistChange(ddb, 'docABC', change);
    }
    const versionAfterBootstrap = ddb.records.get(
      'doc#docABC|snapshot',
    )!.version;
    const putCountBefore = ddb.putCalls.length;

    await persistChange(ddb, 'docABC', changes[changes.length - 1]!);

    expect(ddb.putCalls.length).toBe(putCountBefore);
    expect(ddb.records.get('doc#docABC|snapshot')!.version).toBe(
      versionAfterBootstrap,
    );
  });

  it('bumps version and applies a new change on top of an existing snapshot', async () => {
    const ddb = new FakeDdb();
    const { changes: bootstrap } = buildClientHistory((d) => {
      d.items.push({ id: 'x', label: 'first' });
    });
    for (const change of bootstrap) {
      await persistChange(ddb, 'docABC', change);
    }
    const baseVersion = bootstrap.length;
    ddb.putCalls = [];

    const clientDoc = Automerge.load<State>(
      ddb.records.get('doc#docABC|snapshot')!.binary,
    );
    const after = Automerge.change(clientDoc, (d) => {
      d.items.push({ id: 'y', label: 'second' });
    });
    const [newChange] = Automerge.getChanges(clientDoc, after);

    await persistChange(ddb, 'docABC', newChange!);

    const stored = ddb.records.get('doc#docABC|snapshot')!;
    expect(stored.version).toBe(baseVersion + 1);
    const loaded = Automerge.load<State>(stored.binary);
    expect(loaded.items.map((i) => i.label)).toEqual(['first', 'second']);
  });

  it('writes a v1 snapshot when the doc does not exist yet', async () => {
    const ddb = new FakeDdb();
    const { changes } = buildClientHistory((d) => {
      d.items.push({ id: 'x', label: 'first' });
    });

    for (const change of changes) {
      await persistChange(ddb, 'docABC', change);
    }

    const stored = ddb.records.get('doc#docABC|snapshot');
    expect(stored).toBeDefined();
    expect(stored!.version).toBe(changes.length);
    const loaded = Automerge.load<State>(stored!.binary);
    expect(loaded.items.map((i) => i.label)).toEqual(['first']);
  });
});
