import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { Resource } from 'sst';

import type { SnapshotRecord } from './persister';

export type SnapshotReader = {
  get(pk: string, sk: string): Promise<SnapshotRecord | undefined>;
};

export type SnapshotResponse = {
  statusCode: number;
  headers?: Record<string, string>;
  body?: string;
  isBase64Encoded?: boolean;
};

export async function fetchSnapshot(
  reader: SnapshotReader,
  documentId: string | undefined,
): Promise<SnapshotResponse> {
  if (!documentId) {
    return { statusCode: 400 };
  }
  const record = await reader.get(`doc#${documentId}`, 'snapshot');
  if (!record) {
    return { statusCode: 404 };
  }
  return {
    statusCode: 200,
    headers: { 'content-type': 'application/octet-stream' },
    body: Buffer.from(record.binary).toString('base64'),
    isBase64Encoded: true,
  };
}

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const dynamoReader: SnapshotReader = {
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
};

type LambdaUrlEvent = {
  queryStringParameters?: Record<string, string | undefined>;
};

export async function handler(
  event: LambdaUrlEvent,
): Promise<SnapshotResponse> {
  const documentId = event.queryStringParameters?.doc;
  return fetchSnapshot(dynamoReader, documentId);
}
