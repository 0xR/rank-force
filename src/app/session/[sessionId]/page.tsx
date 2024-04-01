import { documentClient } from '@/app/db-client';
import Ranking from '@/app/session/[sessionId]/Ranking';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { redirect } from 'next/navigation';

import { Resource } from 'sst';
import { decodeTime } from 'ulid';

function assertDefined<T>(value: T | undefined): asserts value is T {
  if (value === undefined) {
    throw new Error('Expected a defined value');
  }
}

export default async function Page({
  params: { sessionId },
}: {
  params: { sessionId: string };
}) {
  try {
    decodeTime(sessionId);
  } catch (error) {
    redirect('/');
  }

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

  const onChange = async (data: unknown) => {
    'use server';
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
  };

  const firstItem = response.Items?.[0];

  return <Ranking defaultValue={firstItem?.data} onChange={onChange} />;
}
