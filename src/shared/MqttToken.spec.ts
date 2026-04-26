import {
  generateAutomergeUrl,
  parseAutomergeUrl,
} from '@automerge/automerge-repo';
import { ulid } from 'ulid';
import { describe, expect, it } from 'vitest';

import { assertIsToken, validateToken } from './MqttToken';

function freshDocumentId(): string {
  return parseAutomergeUrl(generateAutomergeUrl()).documentId;
}

describe('MqttToken', () => {
  describe('assertIsToken', () => {
    it('accepts an object with documentId and userId strings', () => {
      const token = { documentId: freshDocumentId(), userId: ulid() };
      expect(() => assertIsToken(token)).not.toThrow();
    });

    it('rejects a token missing documentId', () => {
      expect(() => assertIsToken({ userId: ulid() })).toThrow();
    });

    it('rejects a token missing userId', () => {
      expect(() => assertIsToken({ documentId: freshDocumentId() })).toThrow();
    });
  });

  describe('validateToken', () => {
    it('accepts a valid Automerge documentId and ULID userId', () => {
      const token = { documentId: freshDocumentId(), userId: ulid() };
      expect(() => validateToken(token)).not.toThrow();
    });

    it('rejects a documentId that is not a valid Automerge id', () => {
      const token = { documentId: 'not-base58!!!', userId: ulid() };
      expect(() => validateToken(token)).toThrow();
    });

    it('rejects a userId that is not a ULID', () => {
      const token = { documentId: freshDocumentId(), userId: 'nope' };
      expect(() => validateToken(token)).toThrow();
    });
  });
});
