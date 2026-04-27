import { State } from '@/core/State';
import * as Automerge from '@automerge/automerge';
import { isValidDocumentId, Repo } from '@automerge/automerge-repo';
import { afterEach, describe, expect, it, vi } from 'vitest';

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
    afterEach(() => {
      vi.unstubAllEnvs();
      vi.unstubAllGlobals();
    });

    it('loads a handle for a documentId previously returned by createSession', async () => {
      const documentId = await createSession();
      const handle = await loadDocHandle(documentId);
      expect(handle.documentId).toBe(documentId);
      const doc = handle.doc();
      expect(doc?.items).toEqual([]);
      expect(doc?.dimensions).toEqual([]);
    });

    it('hydrates from the snapshot endpoint when the doc is not local and no peer is available', async () => {
      const remoteRepo = new Repo({ network: [] });
      const seed = remoteRepo.create<State>({
        items: [{ id: 'item-1', label: 'Mars' }],
        dimensions: [],
        users: [],
        rankingsByUser: {},
        dimensionWeights: {},
      });
      await seed.whenReady();
      const documentId = seed.documentId;
      const bytes = Automerge.save(seed.doc());

      vi.stubEnv('VITE_SNAPSHOT_URL', 'https://snapshots.test/load');
      const fetchSpy = vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input.toString();
        expect(url).toContain(encodeURIComponent(documentId));
        return new Response(bytes, { status: 200 });
      });
      vi.stubGlobal('fetch', fetchSpy);

      const handle = await loadDocHandle(documentId);
      expect(handle.documentId).toBe(documentId);
      expect(handle.doc()?.items).toEqual([{ id: 'item-1', label: 'Mars' }]);
      expect(fetchSpy).toHaveBeenCalled();
    });
  });
});
