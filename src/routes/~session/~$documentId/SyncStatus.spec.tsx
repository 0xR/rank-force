import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { SyncStatus } from './SyncStatus';
import { resetSyncStatus, setSyncStatus } from './syncStatus';

describe('SyncStatus', () => {
  beforeEach(() => {
    resetSyncStatus();
  });

  it('renders the offline state by default', () => {
    render(<SyncStatus />);
    const node = screen.getByRole('status');
    expect(node.getAttribute('aria-label')).toMatch(/offline/i);
    expect(node.getAttribute('title')).toMatch(/local changes are saved/i);
  });

  it('reflects the live state', () => {
    render(<SyncStatus />);
    act(() => {
      setSyncStatus({ status: 'live', pending: 0 });
    });
    const node = screen.getByRole('status');
    expect(node.getAttribute('aria-label')).toMatch(/live/i);
    expect(node.getAttribute('title')).toMatch(/all changes synced/i);
  });

  it('reflects the syncing state with a pending count in the tooltip', () => {
    render(<SyncStatus />);
    act(() => {
      setSyncStatus({ status: 'syncing', pending: 3 });
    });
    const node = screen.getByRole('status');
    expect(node.getAttribute('aria-label')).toMatch(/syncing/i);
    expect(node.getAttribute('title')).toMatch(/3 changes pending/);
  });

  it('uses a singular noun in the tooltip when one change is pending', () => {
    render(<SyncStatus />);
    act(() => {
      setSyncStatus({ status: 'syncing', pending: 1 });
    });
    expect(screen.getByRole('status').getAttribute('title')).toMatch(
      /1 change pending/,
    );
  });
});
