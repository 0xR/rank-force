import { State } from '@/core/State';
import { createSession, loadDocHandle, repo } from '@/lib/repo';
import { routeTree } from '@/routeTree.gen.ts';
import { NAVIGATOR_ID_KEY } from '@/shared/useNavigator';
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

  it('joins a new session under the existing navigator id', async () => {
    localStorage.setItem('rank-force-navigator-name', JSON.stringify('Alice'));
    localStorage.setItem(NAVIGATOR_ID_KEY, JSON.stringify('nav-stable-id'));
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

    const handle = await loadDocHandle(documentId);
    await waitFor(() => {
      const users = (handle.doc() as State).users;
      expect(users).toHaveLength(1);
      expect(users[0]!.name).toBe('Alice');
      expect(users[0]!.id).toBe('nav-stable-id');
    });
  });

  it('redirects to /user when no navigator name is set', async () => {
    const documentId = await createSession();

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
