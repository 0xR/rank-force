import { mergeYjsUpdates } from '@/app/session/[sessionId]/yjs';
import { expect } from 'vitest';
import * as Y from 'yjs';

it('should merge data', () => {
  let lastUpdate = '';
  const yDoc = new Y.Doc();
  yDoc.on('update', (update) => {
    lastUpdate = Buffer.from(update).toString('base64');
  });
  yDoc.getMap('shared').set('key', 'value');
  const update1 = Buffer.from(Y.encodeStateAsUpdate(yDoc)).toString('base64');
  yDoc.getMap('shared').set('key2', 'value2');
  const merged = mergeYjsUpdates(update1, lastUpdate);

  const mergedDoc = new Y.Doc();
  Y.applyUpdate(mergedDoc, Buffer.from(merged, 'base64'));
  expect(mergedDoc.getMap('shared').toJSON()).toEqual(
    yDoc.getMap('shared').toJSON(),
  );
});
