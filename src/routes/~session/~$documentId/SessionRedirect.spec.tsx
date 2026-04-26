import { createSession, repo } from '@/lib/repo';
import { routeTree } from '@/routeTree.gen.ts';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';

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
