import { isValidDocumentId } from '@automerge/automerge-repo';
import { describe, expect, it } from 'vitest';

import { createSession, loadDocHandle } from './repo';

describe('repo', () => {
  describe('createSession', () => {
    it('returns a valid Automerge documentId', async () => {
      const documentId = await createSession();
      expect(isValidDocumentId(documentId)).toBe(true);
    });

    it('returns a different id on each call', async () => {
      const a = await createSession();
      const b = await createSession();
      expect(a).not.toBe(b);
    });
  });

  describe('loadDocHandle', () => {
    it('loads a handle for a documentId previously returned by createSession', async () => {
      const documentId = await createSession();
      const handle = await loadDocHandle(documentId);
      expect(handle.documentId).toBe(documentId);
      const doc = handle.doc();
      expect(doc?.items).toEqual([]);
      expect(doc?.dimensions).toEqual([]);
    });
  });
});
