'use server';
import { documentClient } from '@/app/db-client';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { Resource } from 'sst';

// React Server Component to handle Yjs data storage
export async function storeYjsData(sessionId: string, data: unknown) {
  try {
    await documentClient.send(
      new PutCommand({
        TableName: Resource.Table.name,
        Item: {
          pk: sessionId,
          sk: 'YJS_DATA', // sk might not be needed but it's set as "YJS_DATA" for consistency
          data,
        },
      }),
    );
    console.log(`Data for session ${sessionId} stored successfully.`);
  } catch (error) {
    console.error(`Error storing data for session ${sessionId}:`, error);
  }
}
