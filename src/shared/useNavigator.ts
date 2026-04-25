import { useLocalStorage } from 'usehooks-ts';

/**
 * Global navigator identity — persisted across sessions so a returning
 * user doesn't have to re-enter their name every mission.
 */
export function useNavigatorName() {
  return useLocalStorage<string>('rank-force-navigator-name', '');
}
