import { mergeYjsUpdates } from '@/app/session/[sessionId]/yjs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { Resource } from 'sst';

const documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function getCurrentData(sessionId: string) {
  const response = await documentClient.send(
    new QueryCommand({
      TableName: Resource.Table.name,
      KeyConditionExpression: 'pk = :sessionId AND sk = :sk',
      ExpressionAttributeValues: {
        ':sessionId': sessionId,
        ':sk': 'YJS_DATA',
      },
    }),
  );

  return response.Items?.[0]?.data as string | undefined;
}

export async function storeData(sessionId: string, data: string) {
  let currentDataForMerge = await getCurrentData(sessionId);
  let attempt = 0;
  while (true) {
    const newData = currentDataForMerge
      ? mergeYjsUpdates(currentDataForMerge, data)
      : data;
    try {
      await documentClient.send(
        new PutCommand({
          TableName: Resource.Table.name,
          Item: {
            pk: sessionId,
            sk: 'YJS_DATA', // sk might not be needed but it's set as "YJS_DATA" for consistency
            data: newData,
          },
          ConditionExpression: currentDataForMerge
            ? '#data = :currentData'
            : undefined,
          ExpressionAttributeNames: currentDataForMerge
            ? { '#data': 'data' }
            : undefined,
          ExpressionAttributeValues: currentDataForMerge
            ? { ':currentData': currentDataForMerge }
            : undefined,
        }),
      );
      console.log(`Data for session ${sessionId} stored successfully.`);
      break;
    } catch (error) {
      if (attempt >= 3) {
        throw error;
      }
      currentDataForMerge = await getCurrentData(sessionId);
    } finally {
      attempt++;
    }
  }
}
