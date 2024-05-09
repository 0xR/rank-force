import { documentClient } from '@/app/db-client';
import Ranking from '@/app/session/[sessionId]/Ranking';
import { mergeYjsUpdates } from '@/app/session/[sessionId]/yjs';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { redirect } from 'next/navigation';

import { Resource } from 'sst';
import { decodeTime } from 'ulid';
import * as Y from 'yjs';

function showDocument(update: string) {
  const doc = new Y.Doc();
  Y.applyUpdate(doc, Buffer.from(update, 'base64'));
  console.log(JSON.stringify(doc.getMap('shared').toJSON(), null, 2));
}

function assertDefined<T>(value: T | undefined): asserts value is T {
  if (value === undefined) {
    throw new Error('Expected a defined value');
  }
}

async function getCurrentData(sessionId: string) {
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

export default async function Page({
  params: { sessionId },
}: {
  params: { sessionId: string };
}) {
  try {
    const decodedTime = decodeTime(sessionId);
    if (decodedTime > Date.now()) {
      redirect('/');
    }
  } catch (error) {
    redirect('/');
  }
  const currentData = await getCurrentData(sessionId);

  if (currentData) {
    showDocument(currentData);
  }

  const onChange = async (data: string) => {
    'use server';
    let currentDataForMerge = currentData;
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
  };

  return <Ranking onChange={onChange} defaultValue={currentData} />;
}
