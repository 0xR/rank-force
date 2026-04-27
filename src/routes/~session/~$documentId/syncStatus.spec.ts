import {
  getSyncStatusSnapshot,
  resetSyncStatus,
  setSyncStatus,
  subscribeSyncStatus,
} from './syncStatus';

describe('syncStatus store', () => {
  beforeEach(() => {
    resetSyncStatus();
  });

  it('starts offline with no pending changes', () => {
    expect(getSyncStatusSnapshot()).toEqual({ status: 'offline', pending: 0 });
  });

  it('returns a referentially stable snapshot when nothing changed', () => {
    const before = getSyncStatusSnapshot();
    setSyncStatus({ status: 'offline', pending: 0 });
    expect(getSyncStatusSnapshot()).toBe(before);
  });

  it('notifies subscribers when status changes', () => {
    let calls = 0;
    subscribeSyncStatus(() => {
      calls += 1;
    });
    setSyncStatus({ status: 'live', pending: 0 });
    expect(calls).toBe(1);
    expect(getSyncStatusSnapshot()).toEqual({ status: 'live', pending: 0 });
  });

  it('does not notify subscribers when state is unchanged', () => {
    setSyncStatus({ status: 'live', pending: 0 });
    let calls = 0;
    subscribeSyncStatus(() => {
      calls += 1;
    });
    setSyncStatus({ status: 'live', pending: 0 });
    expect(calls).toBe(0);
  });

  it('stops notifying after unsubscribe', () => {
    let calls = 0;
    const unsub = subscribeSyncStatus(() => {
      calls += 1;
    });
    setSyncStatus({ status: 'live', pending: 0 });
    unsub();
    setSyncStatus({ status: 'syncing', pending: 1 });
    expect(calls).toBe(1);
  });
});
