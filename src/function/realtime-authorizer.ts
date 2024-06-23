import { MqttToken } from '@/shared/MqttToken';
import { realtime } from 'sst/aws/realtime';
import { decodeTime } from 'ulid';

export function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== 'string') {
    throw new Error('Not a string');
  }
}

export function assertIsNonEmptyString(
  value: unknown,
): asserts value is string {
  assertIsString(value);
  if (value === '') {
    throw new Error('Empty string');
  }
}

export function assertIsObject(
  input: unknown,
): asserts input is Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new Error('Not an object');
  }
}

function assertIsToken(parsed: unknown): asserts parsed is MqttToken {
  assertIsObject(parsed);
  assertIsNonEmptyString(parsed.sessionId);
  assertIsNonEmptyString(parsed.userId);
}

function validateToken(token: MqttToken) {
  decodeTime(token.sessionId);
  decodeTime(token.userId);
}

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
