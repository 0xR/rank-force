import * as Y from 'yjs';

function jsonToYType<T>(
  value: T,
  yParent: Y.Map<unknown> | Y.Array<unknown>,
  parentKey?: string,
) {
  if (Array.isArray(value)) {
    // Handle arrays
    const yArray = new Y.Array();
    value.forEach((item) => jsonToYType(item, yArray));
    if (yParent instanceof Y.Array) {
      yParent.push([yArray]);
    } else if (yParent instanceof Y.Map && parentKey !== undefined) {
      yParent.set(parentKey, yArray);
    }
  } else if (typeof value === 'object' && value !== null) {
    // Handle objects
    const yMap = new Y.Map();
    Object.entries(value).forEach(([key, val]) => {
      jsonToYType(val, yMap, key);
    });
    if (yParent instanceof Y.Array) {
      yParent.push([yMap]);
    } else if (yParent instanceof Y.Map && parentKey !== undefined) {
      yParent.set(parentKey, yMap);
    }
  } else {
    // Handle primitives
    if (yParent instanceof Y.Array) {
      yParent.push([value]);
    } else if (yParent instanceof Y.Map && parentKey !== undefined) {
      yParent.set(parentKey, value);
    }
  }
}

// Generic function to deserialize unknown JSON object to a Yjs document
export function deserializeJsonToYDoc<T>(jsonObject: {
  [s: string]: T;
}): Y.Doc {
  const doc = new Y.Doc();
  const rootMap = doc.getMap('root');
  Object.entries(jsonObject).forEach(([key, value]) => {
    jsonToYType(value, rootMap, key);
  });
  return doc;
}

export function sync(doc1: Y.Doc, doc2: Y.Doc) {
  // Calculate the difference (delta) since the last update
  const diffUpdate1 = Y.encodeStateAsUpdate(doc1, Y.encodeStateVector(doc2));
  const diffUpdate2 = Y.encodeStateAsUpdate(doc2, Y.encodeStateVector(doc1));

  // console.log('diff1', new TextDecoder().decode(diffUpdate1));
  // console.log('diff2', new TextDecoder().decode(diffUpdate2));

  // Apply the diff to doc2
  Y.applyUpdate(doc2, diffUpdate1);
  Y.applyUpdate(doc1, diffUpdate2);
}
