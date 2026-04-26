import { decodeTime } from 'ulid';

import { assertIsNonEmptyString, assertIsObject } from './type-assertions';

export type MqttToken = {
  documentId: string;
  userId: string;
};

// Sanity-check: Automerge documentIds are base58check-encoded 20-byte
// (16 + 4 checksum) blobs, ~27-28 chars. Strict validation lives in the
// browser where automerge-repo is already loaded; the authorizer just
// rejects obviously bogus values without pulling Automerge into its bundle.
const DOCUMENT_ID_RE = /^[1-9A-HJ-NP-Za-km-z]{20,40}$/;

export function assertIsToken(parsed: unknown): asserts parsed is MqttToken {
  assertIsObject(parsed);
  assertIsNonEmptyString(parsed.documentId);
  assertIsNonEmptyString(parsed.userId);
}

export function validateToken(token: MqttToken) {
  if (!DOCUMENT_ID_RE.test(token.documentId)) {
    throw new Error('Invalid documentId');
  }
  decodeTime(token.userId);
}
