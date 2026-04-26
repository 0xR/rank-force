import { describe, expect, it } from 'vitest';

import type { SnapshotRecord } from './persister';
import { SnapshotReader, fetchSnapshot } from './snapshot-fetch';

class FakeReader implements SnapshotReader {
  records = new Map<string, SnapshotRecord>();
  async get(pk: string, sk: string): Promise<SnapshotRecord | undefined> {
    return this.records.get(`${pk}|${sk}`);
  }
}

describe('fetchSnapshot', () => {
  it('returns 400 when the doc query parameter is missing', async () => {
    const reader = new FakeReader();
    const result = await fetchSnapshot(reader, undefined);
    expect(result.statusCode).toBe(400);
  });

  it('returns 404 when no snapshot exists for the documentId', async () => {
    const reader = new FakeReader();
    const result = await fetchSnapshot(reader, 'docMissing');
    expect(result.statusCode).toBe(404);
  });

  it('returns 200 with base64 binary on hit', async () => {
    const reader = new FakeReader();
    const binary = new Uint8Array([1, 2, 3, 4, 5]);
    reader.records.set('doc#docABC|snapshot', {
      pk: 'doc#docABC',
      sk: 'snapshot',
      binary,
      version: 1,
    });

    const result = await fetchSnapshot(reader, 'docABC');

    expect(result.statusCode).toBe(200);
    expect(result.isBase64Encoded).toBe(true);
    expect(result.headers?.['content-type']).toBe('application/octet-stream');
    expect(Buffer.from(result.body!, 'base64')).toEqual(Buffer.from(binary));
  });
});
