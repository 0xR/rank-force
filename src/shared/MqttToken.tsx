import { isValidDocumentId } from '@automerge/automerge-repo';
import { decodeTime } from 'ulid';

import { assertIsNonEmptyString, assertIsObject } from './type-assertions';

export type MqttToken = {
  documentId: string;
  userId: string;
};

export function assertIsToken(parsed: unknown): asserts parsed is MqttToken {
  assertIsObject(parsed);
  assertIsNonEmptyString(parsed.documentId);
  assertIsNonEmptyString(parsed.userId);
}

export function validateToken(token: MqttToken) {
  if (!isValidDocumentId(token.documentId)) {
    throw new Error('Invalid documentId');
  }
  decodeTime(token.userId);
}
