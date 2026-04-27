import { State } from '@/core/State';
import { createSession, loadDocHandle, repo } from '@/lib/repo';
import { routeTree } from '@/routeTree.gen.ts';
import { userIdStorageKey } from '@/routes/~session/~$documentId/shared/useUser';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen, waitFor } from '@testing-library/react';

describe('session index redirect', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('redirects to the user page when no user is configured', async () => {
    const documentId = await createSession();
    const memoryHistory = createMemoryHistory({
      initialEntries: [`/session/${documentId}`],
    });
    const router = createRouter({ routeTree, history: memoryHistory });

    render(
      <RepoContext.Provider value={repo}>
        <RouterProvider router={router} />
      </RepoContext.Provider>,
    );

    expect(await screen.findByLabelText('Your name')).toBeTruthy();
  });

  it('redirects to the user page from the app root when no user is configured', async () => {
    const memoryHistory = createMemoryHistory({ initialEntries: ['/'] });
    const router = createRouter({ routeTree, history: memoryHistory });

    render(
      <RepoContext.Provider value={repo}>
        <RouterProvider router={router} />
      </RepoContext.Provider>,
    );

    expect(await screen.findByLabelText('Your name')).toBeTruthy();
  });

  it('redirects to the user page when the session root URL has a trailing slash', async () => {
    const documentId = await createSession();
    const memoryHistory = createMemoryHistory({
      initialEntries: [`/session/${documentId}/`],
    });
    const router = createRouter({ routeTree, history: memoryHistory });

    render(
      <RepoContext.Provider value={repo}>
        <RouterProvider router={router} />
      </RepoContext.Provider>,
    );

    expect(await screen.findByLabelText('Your name')).toBeTruthy();
  });

  it('auto-rejoins when localStorage userId points at a user no longer in the doc', async () => {
    localStorage.setItem('rank-force-navigator-name', JSON.stringify('Alice'));
    const documentId = await createSession();
    localStorage.setItem(
      userIdStorageKey(documentId),
      JSON.stringify('orphaned-user-id'),
    );

    const memoryHistory = createMemoryHistory({
      initialEntries: [`/session/${documentId}`],
    });
    const router = createRouter({ routeTree, history: memoryHistory });

    render(
      <RepoContext.Provider value={repo}>
        <RouterProvider router={router} />
      </RepoContext.Provider>,
    );

    const handle = await loadDocHandle(documentId);
    await waitFor(() => {
      const users = (handle.doc() as State).users;
      expect(users).toHaveLength(1);
      expect(users[0]!.name).toBe('Alice');
      expect(users[0]!.id).not.toBe('orphaned-user-id');
    });
  });

  it('redirects to /user when localStorage userId is stale and no navigator name is set', async () => {
    const documentId = await createSession();
    localStorage.setItem(
      userIdStorageKey(documentId),
      JSON.stringify('orphaned-user-id'),
    );

    const memoryHistory = createMemoryHistory({
      initialEntries: [`/session/${documentId}/configure`],
    });
    const router = createRouter({ routeTree, history: memoryHistory });

    render(
      <RepoContext.Provider value={repo}>
        <RouterProvider router={router} />
      </RepoContext.Provider>,
    );

    expect(await screen.findByLabelText('Your name')).toBeTruthy();
  });

  it('redirects to configure when navigator name is already set', async () => {
    localStorage.setItem(
      'rank-force-navigator-name',
      JSON.stringify('test-user'),
    );
    const documentId = await createSession();
    const memoryHistory = createMemoryHistory({
      initialEntries: [`/session/${documentId}`],
    });
    const router = createRouter({ routeTree, history: memoryHistory });

    render(
      <RepoContext.Provider value={repo}>
        <RouterProvider router={router} />
      </RepoContext.Provider>,
    );

    expect(await screen.findByText('Items')).toBeTruthy();
  });
});
