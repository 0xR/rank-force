import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { State } from '@/core/State';
import { User } from '@/core/User';
import { createSession, loadDocHandle, repo } from '@/lib/repo';
import { routeTree } from '@/routeTree.gen.ts';
import { userIdStorageKey } from '@/routes/~session/~$documentId/shared/useUser';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const NAVIGATOR_NAME_KEY = 'rank-force-navigator-name';

async function setupSession(opts: {
  users: User[];
  rankingsByUser?: Record<string, Record<string, string[]>>;
  selfId?: string | null;
}) {
  const documentId = await createSession();
  const handle = await loadDocHandle(documentId);
  handle.change((d) => {
    d.users.push(...opts.users);
    if (opts.rankingsByUser) {
      for (const [uid, byDim] of Object.entries(opts.rankingsByUser)) {
        d.rankingsByUser[uid] = byDim;
      }
    }
  });

  localStorage.setItem(NAVIGATOR_NAME_KEY, JSON.stringify('Tester'));
  if (opts.selfId !== null) {
    localStorage.setItem(
      userIdStorageKey(documentId),
      JSON.stringify(opts.selfId ?? opts.users[0]!.id),
    );
  }

  const memoryHistory = createMemoryHistory({
    initialEntries: [`/session/${documentId}/configure`],
  });
  const router = createRouter({ routeTree, history: memoryHistory });
  render(
    <RepoContext.Provider value={repo}>
      <RouterProvider router={router} />
    </RepoContext.Provider>,
  );
  return { documentId, handle };
}

describe('Configure / Participants', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders a row per user with a remove button', async () => {
    const alice = User.make('Alice', 'u-alice');
    const bob = User.make('Bob', 'u-bob');
    await setupSession({ users: [alice, bob] });

    expect(await screen.findByText('Participants')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Remove Alice/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Remove Bob/ })).toBeTruthy();
  });

  it('removes a user with no rankings without confirmation', async () => {
    const alice = User.make('Alice', 'u-alice');
    const bob = User.make('Bob', 'u-bob');
    const { handle } = await setupSession({
      users: [alice, bob],
      selfId: alice.id,
    });

    const confirmSpy = vi.spyOn(window, 'confirm');

    const removeBob = await screen.findByRole('button', {
      name: /Remove Bob/,
    });
    fireEvent.click(removeBob);

    await waitFor(() => {
      expect((handle.doc() as State).users.map((u) => u.id)).toEqual([
        alice.id,
      ]);
    });
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('asks for confirmation when removing a user who has rankings', async () => {
    const alice = User.make('Alice', 'u-alice');
    const bob = User.make('Bob', 'u-bob');
    const dim = RankDimension.make('Quality', 'Lo', 'Hi', 'ascending', 'd-1');
    const item = Item.make('Apple', 'i-1');
    const documentId = await createSession();
    const handle = await loadDocHandle(documentId);
    handle.change((d) => {
      d.users.push(alice, bob);
      d.dimensions.push(dim);
      d.items.push(item);
      d.dimensionWeights[dim.id] = 1;
      d.rankingsByUser[bob.id] = { [dim.id]: [item.id] };
    });

    localStorage.setItem(NAVIGATOR_NAME_KEY, JSON.stringify('Alice'));
    localStorage.setItem(
      userIdStorageKey(documentId),
      JSON.stringify(alice.id),
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

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    const removeBob = await screen.findByRole('button', {
      name: /Remove Bob/,
    });
    fireEvent.click(removeBob);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalled();
    });
    expect((handle.doc() as State).users.map((u) => u.id)).toEqual([
      alice.id,
      bob.id,
    ]);

    confirmSpy.mockReturnValue(true);
    fireEvent.click(removeBob);
    await waitFor(() => {
      expect((handle.doc() as State).users.map((u) => u.id)).toEqual([
        alice.id,
      ]);
    });
    confirmSpy.mockRestore();
  });

  it('disables the remove button for the current viewer', async () => {
    const alice = User.make('Alice', 'u-alice');
    const bob = User.make('Bob', 'u-bob');
    await setupSession({ users: [alice, bob], selfId: alice.id });

    const removeAlice = await screen.findByRole('button', {
      name: /Remove Alice/,
    });
    expect(removeAlice.hasAttribute('disabled')).toBe(true);
  });
});
