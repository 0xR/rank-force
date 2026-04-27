function assertIsString(value: unknown): asserts value is string {
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
