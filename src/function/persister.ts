import { State } from '@/core/State';
import * as Automerge from '@automerge/automerge/slim';
import { automergeWasmBase64 } from '@automerge/automerge/automerge.wasm.base64';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { Resource } from 'sst';

export type SnapshotRecord = {
  pk: string;
  sk: string;
  binary: Uint8Array;
  version: number;
};

export type DdbPort = {
  get(pk: string, sk: string): Promise<SnapshotRecord | undefined>;
  put(record: SnapshotRecord, expectedVersion: number): Promise<void>;
};

export class ConditionalCheckFailedError extends Error {
  constructor() {
    super('ConditionalCheckFailed');
    this.name = 'ConditionalCheckFailedError';
  }
}

let wasmReady: Promise<void> | undefined;
function ensureWasm(): Promise<void> {
  wasmReady ??= Automerge.initializeBase64Wasm(automergeWasmBase64);
  return wasmReady;
}

export async function persistChange(
  ddb: DdbPort,
  documentId: string,
  changeBytes: Uint8Array,
): Promise<void> {
  await ensureWasm();
  const pk = `doc#${documentId}`;
  const sk = 'snapshot';
  for (let attempt = 0; ; attempt++) {
    const existing = await ddb.get(pk, sk);
    const oldVersion = existing?.version ?? 0;
    const baseDoc = existing
      ? Automerge.load<State>(existing.binary)
      : Automerge.init<State>();
    const [nextDoc] = Automerge.applyChanges(baseDoc, [changeBytes]);
    const nextBinary = Automerge.save(nextDoc);
    if (existing && bytesEqual(existing.binary, nextBinary)) {
      return;
    }
    try {
      await ddb.put(
        { pk, sk, binary: nextBinary, version: oldVersion + 1 },
        oldVersion,
      );
      return;
    } catch (err) {
      if (err instanceof ConditionalCheckFailedError && attempt < 3) {
        continue;
      }
      throw err;
    }
  }
}

function bytesEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export const dynamoDdbPort: DdbPort = {
  async get(pk, sk) {
    const out = await docClient.send(
      new GetCommand({ TableName: Resource.Table.name, Key: { pk, sk } }),
    );
    if (!out.Item) return undefined;
    return {
      pk,
      sk,
      version: out.Item.version as number,
      binary: out.Item.binary as Uint8Array,
    };
  },
  async put(record, expectedVersion) {
    try {
      await docClient.send(
        new PutCommand({
          TableName: Resource.Table.name,
          Item: record,
          ConditionExpression:
            'attribute_not_exists(pk) OR version = :expected',
          ExpressionAttributeValues: { ':expected': expectedVersion },
        }),
      );
    } catch (err) {
      if (
        err instanceof Error &&
        err.name === 'ConditionalCheckFailedException'
      ) {
        throw new ConditionalCheckFailedError();
      }
      throw err;
    }
  },
};

type IotEvent = {
  topic?: string;
  payload?: unknown;
};

function decodePayload(payload: unknown): Uint8Array {
  if (typeof payload === 'string') {
    return new Uint8Array(Buffer.from(payload, 'base64'));
  }
  if (payload instanceof Uint8Array) return payload;
  if (Buffer.isBuffer(payload)) return new Uint8Array(payload);
  throw new Error('Unsupported MQTT payload type');
}

function documentIdFromTopic(topic: string): string {
  const idx = topic.lastIndexOf('/');
  return idx >= 0 ? topic.slice(idx + 1) : topic;
}

export async function handler(event: IotEvent): Promise<void> {
  console.log('persister event keys:', Object.keys(event ?? {}));
  console.log('persister topic:', event.topic);
  console.log('persister payload type:', typeof event.payload);
  if (typeof event.payload === 'string') {
    console.log(
      'persister payload (string len, head):',
      event.payload.length,
      event.payload.slice(0, 64),
    );
  } else if (event.payload && typeof event.payload === 'object') {
    console.log(
      'persister payload (object keys):',
      Object.keys(event.payload as object),
    );
  }
  if (!event.topic) {
    console.warn('persister: missing topic on event');
    return;
  }
  const documentId = documentIdFromTopic(event.topic);
  const changeBytes = decodePayload(event.payload);
  console.log('persister change bytes:', changeBytes.length);
  try {
    await persistChange(dynamoDdbPort, documentId, changeBytes);
    console.log('persister persistChange ok for', documentId);
  } catch (err) {
    console.error('persister persistChange failed', err);
    throw err;
  }
}
