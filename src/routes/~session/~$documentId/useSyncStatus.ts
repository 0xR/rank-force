import { useSyncExternalStore } from 'react';
import {
  getSyncStatusSnapshot,
  subscribeSyncStatus,
} from '@/routes/~session/~$documentId/syncStatus';

export function useSyncStatus() {
  return useSyncExternalStore(subscribeSyncStatus, getSyncStatusSnapshot);
}
