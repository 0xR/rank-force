import { expect } from 'vitest';
import * as Y from 'yjs';
import { deserializeJsonToYDoc } from './yjs-serialization.ts';

function sync(doc1: Y.Doc, doc2: Y.Doc) {
  // Calculate the difference (delta) since the last update
  const diffUpdate1 = Y.encodeStateAsUpdate(doc1, Y.encodeStateVector(doc2));
  const diffUpdate2 = Y.encodeStateAsUpdate(doc2, Y.encodeStateVector(doc1));

  console.log('diff1', new TextDecoder().decode(diffUpdate1));
  console.log('diff2', new TextDecoder().decode(diffUpdate2));

  // Apply the diff to doc2
  Y.applyUpdate(doc2, diffUpdate1);
  Y.applyUpdate(doc1, diffUpdate2);
}

describe('Yjs', () => {
  it('should work', () => {
    // Create two YDocs
    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    // Create a shared type in each document
    const map1 = doc1.getMap('map');
    const map2 = doc2.getMap('map');

    expect(doc1.toJSON()).toEqual(doc2.toJSON());

    // Now, let's sync with a diff
    // Modify doc1
    // map1.set('key', 'value2');
    // map1.clear();
    map1.set('key', 'value3');
    map2.set('key', 'value3');
    sync(doc1, doc2);

    expect(doc1.toJSON()).toEqual(doc2.toJSON());
    console.log(doc1.toJSON());
  });

  it('should work with JSON', () => {
    // Example usage with a complex JSON object
    const complexJsonObject = {
      key1: 'value1',
      key2: 123,
      key3: [1, 2, 3],
      key4: {
        nestedKey1: 'nestedValue1',
        nestedKey2: ['arrayValue1', 'arrayValue2'],
      },
    };

    const yDoc = deserializeJsonToYDoc(complexJsonObject);
    console.log(yDoc.toJSON());
  });
});
