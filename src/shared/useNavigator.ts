import { useState } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { ulid } from 'ulid';

export const NAVIGATOR_NAME_KEY = 'rank-force-navigator-name';
export const NAVIGATOR_ID_KEY = 'rank-force-navigator-id';

/**
 * Global navigator identity — persisted across sessions so a returning
 * user doesn't have to re-enter their name every mission.
 */
export function useNavigatorName() {
  return useLocalStorage<string>(NAVIGATOR_NAME_KEY, '');
}

export function readOrCreateNavigatorId(): string {
  const raw = window.localStorage.getItem(NAVIGATOR_ID_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'string' && parsed) return parsed;
    } catch {
      // fall through and regenerate
    }
  }
  const fresh = ulid();
  window.localStorage.setItem(NAVIGATOR_ID_KEY, JSON.stringify(fresh));
  return fresh;
}

/**
 * Stable per-browser navigator id. Generated lazily on first read and
 * reused across all sessions so renaming never produces a new identity.
 */
export function useNavigatorId(): string {
  const [id] = useState(readOrCreateNavigatorId);
  return id;
}
