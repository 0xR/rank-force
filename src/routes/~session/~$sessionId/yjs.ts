import * as Y from 'yjs';

// Function to apply updates to a Yjs document stored in DynamoDB
// async function applyClientUpdate(
//   receivedBase64Update: string,
//   docId: string,
// ): Promise<void> {
//   // Assume `getDocumentFromDynamoDB` and `updateDocumentInDynamoDB` are implemented to handle DB operations
//   const currentSerializedState = await getDocumentFromDynamoDB(docId); // Fetch the serialized state from DynamoDB
//   const doc = new Y.Doc();
//
//   // If there is a current state, decode and apply it
//   if (currentSerializedState) {
//     const decodedState = Buffer.from(currentSerializedState, 'base64');
//     Y.applyUpdate(doc, decodedState);
//   }
//
//   // Decode and apply the received update
//   const decodedUpdate = Buffer.from(receivedBase64Update, 'base64');
//   Y.applyUpdate(doc, decodedUpdate);
//
//   // Serialize the updated document state
//   const updatedState = Y.encodeStateAsUpdate(doc);
//   const updatedSerializedState = Buffer.from(updatedState).toString('base64');
//
//   // Store the updated state back into DynamoDB
//   await updateDocumentInDynamoDB(docId, updatedSerializedState);
// }
//
// // These DB handling functions need to be defined according to your environment
// async function getDocumentFromDynamoDB(docId: string): Promise<string | null> {
//   // Implementation for retrieving a document's state
// }
//
// async function updateDocumentInDynamoDB(
//   docId: string,
//   data: string,
// ): Promise<void> {
//   // Implementation for updating a document's state
// }

export function mergeYjsUpdates(update1: string, update2: string): string {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, Buffer.from(update1, 'base64'));
  Y.applyUpdate(doc, Buffer.from(update2, 'base64'));
  return Buffer.from(Y.encodeStateAsUpdate(doc)).toString('base64');
}

export async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

export function yDocFromUint8Array(update: Uint8Array): Y.Doc {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, update);
  return doc;
}
