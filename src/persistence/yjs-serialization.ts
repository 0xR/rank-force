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
