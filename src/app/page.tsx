import { storeYjsData } from '@/app/actions';
import { documentClient } from '@/app/db-client';
import Ranking from '@/app/Ranking';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

import { Resource } from 'sst';

function assertDefined<T>(value: T | undefined): asserts value is T {
  if (value === undefined) {
    throw new Error('Expected a defined value');
  }
}

export default async function Page() {
  const response = await documentClient.send(
    new QueryCommand({
      TableName: Resource.Table.name,
      KeyConditionExpression: 'pk = :sessionId AND sk = :sk',
      ExpressionAttributeValues: {
        ':sessionId': 'my-session-id',
        ':sk': 'YJS_DATA',
      },
    }),
  );

  const firstItem = response.Items?.[0];

  assertDefined(firstItem);

  return <Ranking defaultValue={firstItem.data} onChange={storeYjsData} />;
}
