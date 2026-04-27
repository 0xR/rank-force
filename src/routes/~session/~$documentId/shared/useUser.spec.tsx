import { State } from '@/core/State';
import { User } from '@/core/User';
import { createSession, loadDocHandle, repo } from '@/lib/repo';
import { routeTree } from '@/routeTree.gen.ts';
import { NAVIGATOR_ID_KEY, NAVIGATOR_NAME_KEY } from '@/shared/useNavigator';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

describe('useUser identity stability', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renaming the current user keeps the same userId', async () => {
    localStorage.setItem(NAVIGATOR_ID_KEY, JSON.stringify('nav-stable'));
    localStorage.setItem(NAVIGATOR_NAME_KEY, JSON.stringify('Alice'));
    const documentId = await createSession();
    const handle = await loadDocHandle(documentId);
    handle.change((d) => {
      d.users.push(User.make('Alice', 'nav-stable'));
    });

    const memoryHistory = createMemoryHistory({
      initialEntries: [`/session/${documentId}/user`],
    });
    const router = createRouter({ routeTree, history: memoryHistory });
    render(
      <RepoContext.Provider value={repo}>
        <RouterProvider router={router} />
      </RepoContext.Provider>,
    );

    const input = (await screen.findByLabelText(
      'Your name',
    )) as HTMLInputElement;
    await waitFor(() => expect(input.value).toBe('Alice'));

    fireEvent.change(input, { target: { value: 'Alicia' } });
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));

    await waitFor(() => {
      const users = (handle.doc() as State).users;
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual({ id: 'nav-stable', name: 'Alicia' });
    });
  });

  it('first-join under an existing navigator id adds the user with that id', async () => {
    localStorage.setItem(NAVIGATOR_ID_KEY, JSON.stringify('nav-stable'));
    localStorage.setItem(NAVIGATOR_NAME_KEY, JSON.stringify('Alice'));
    const documentId = await createSession();
    const handle = await loadDocHandle(documentId);

    const memoryHistory = createMemoryHistory({
      initialEntries: [`/session/${documentId}/configure`],
    });
    const router = createRouter({ routeTree, history: memoryHistory });
    render(
      <RepoContext.Provider value={repo}>
        <RouterProvider router={router} />
      </RepoContext.Provider>,
    );

    await waitFor(() => {
      const users = (handle.doc() as State).users;
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual({ id: 'nav-stable', name: 'Alice' });
    });

    const header = await screen.findByRole('banner');
    expect(within(header).getByText('Alice')).toBeTruthy();
  });
});
