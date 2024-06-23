import {
  assertIsNonEmptyString,
  assertIsObject,
} from '@/shared/type-assertions';
import { decodeTime } from 'ulid';

export type MqttToken = {
  sessionId: string;
  userId: string;
};

export function assertIsToken(parsed: unknown): asserts parsed is MqttToken {
  assertIsObject(parsed);
  assertIsNonEmptyString(parsed.sessionId);
  assertIsNonEmptyString(parsed.userId);
}

export function validateToken(token: MqttToken) {
  decodeTime(token.sessionId);
  decodeTime(token.userId);
}
