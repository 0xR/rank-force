import { assertIsToken, validateToken } from '../shared/MqttToken';
import { realtime } from 'sst/aws/realtime';

export const handler = realtime.authorizer(async (token) => {
  console.log('Authorizing token:', token);
  const parsed = JSON.parse(token);
  assertIsToken(parsed);
  validateToken(parsed);
  const topic = `${process.env.SST_TOPIC_PREFIX!}${parsed.sessionId}`;
  return {
    subscribe: [topic],
    publish: [topic],
  };
});
