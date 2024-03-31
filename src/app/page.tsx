import Ranking from '@/app/Ranking';

import { Resource } from 'sst';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export default async function Page() {
  // put demo item to table
  await client.send(
    new PutCommand({
      TableName: Resource.Table.name,
      Item: {
        pk: 'my-session-id',
        sk: 'my-item-id-2',
        data: 'my-item-data-2',
      },
    }),
  );
  const response = await client.send(
    new QueryCommand({
      TableName: Resource.Table.name,
      KeyConditionExpression: 'pk = :sessionId',
      ExpressionAttributeValues: {
        ':sessionId': 'my-session-id',
      },
    }),
  );

  return <Ranking debugString={JSON.stringify(response.Items, null, 2)} />;
}
