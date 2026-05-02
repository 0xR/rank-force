import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { State } from '@/core/State';
import { User } from '@/core/User';
import { createSession, loadDocHandle, repo } from '@/lib/repo';
import { routeTree } from '@/routeTree.gen.ts';
import { NAVIGATOR_ID_KEY } from '@/shared/useNavigator';
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
      NAVIGATOR_ID_KEY,
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
    localStorage.setItem(NAVIGATOR_ID_KEY, JSON.stringify(alice.id));

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

  it('lets the user edit a criterion in place and saves the change', async () => {
    const alice = User.make('Alice', 'u-alice');
    const dim = RankDimension.make(
      'Quality',
      'Bad',
      'Good',
      'ascending',
      'd-1',
    );
    const documentId = await createSession();
    const handle = await loadDocHandle(documentId);
    handle.change((d) => {
      d.users.push(alice);
      d.dimensions.push(dim);
      d.dimensionWeights[dim.id] = 1;
    });

    localStorage.setItem(NAVIGATOR_NAME_KEY, JSON.stringify('Alice'));
    localStorage.setItem(NAVIGATOR_ID_KEY, JSON.stringify(alice.id));

    const memoryHistory = createMemoryHistory({
      initialEntries: [`/session/${documentId}/configure`],
    });
    const router = createRouter({ routeTree, history: memoryHistory });
    render(
      <RepoContext.Provider value={repo}>
        <RouterProvider router={router} />
      </RepoContext.Provider>,
    );

    const editBtn = await screen.findByRole('button', {
      name: /Edit Quality/,
    });
    fireEvent.click(editBtn);

    const nameInputs = (await screen.findAllByLabelText(
      /Criterion/,
    )) as HTMLInputElement[];
    const editInput = nameInputs.find((el) => el.value === 'Quality')!;
    fireEvent.change(editInput, { target: { value: 'Quality of fit' } });

    fireEvent.click(screen.getByRole('button', { name: /Save criterion/ }));

    await waitFor(() => {
      const updated = (handle.doc() as State).dimensions[0]!;
      expect(updated.id).toBe(dim.id);
      expect(updated.name).toBe('Quality of fit');
    });
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

describe('Configure / Participants ranking progress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  async function setupProgressSession(
    opts: {
      items?: Item[];
      dimensions?: RankDimension[];
      rankingsByUser?: Record<string, Record<string, string[]>>;
    } = {},
  ) {
    const alice = User.make('Alice', 'u-alice');
    const bob = User.make('Bob', 'u-bob');
    const documentId = await createSession();
    const handle = await loadDocHandle(documentId);
    handle.change((d) => {
      d.users.push(alice, bob);
      if (opts.items) d.items.push(...opts.items);
      if (opts.dimensions) {
        d.dimensions.push(...opts.dimensions);
        for (const dim of opts.dimensions) {
          d.dimensionWeights[dim.id] = 1 / opts.dimensions.length;
        }
      }
      if (opts.rankingsByUser) {
        for (const [uid, byDim] of Object.entries(opts.rankingsByUser)) {
          d.rankingsByUser[uid] = byDim;
        }
      }
    });

    localStorage.setItem(NAVIGATOR_NAME_KEY, JSON.stringify('Alice'));
    localStorage.setItem(NAVIGATOR_ID_KEY, JSON.stringify(alice.id));

    const memoryHistory = createMemoryHistory({
      initialEntries: [`/session/${documentId}/configure`],
    });
    const router = createRouter({ routeTree, history: memoryHistory });
    render(
      <RepoContext.Provider value={repo}>
        <RouterProvider router={router} />
      </RepoContext.Provider>,
    );
    return { alice, bob };
  }

  it('shows nothing when there are no items or criteria yet', async () => {
    await setupProgressSession();
    expect(
      await screen.findByRole('button', { name: /Remove Alice/ }),
    ).toBeTruthy();
    expect(screen.queryByText(/Not started/i)).toBeNull();
    expect(screen.queryByLabelText(/All rankings complete/i)).toBeNull();
    expect(screen.queryByLabelText(/of \d+ ranked/i)).toBeNull();
  });

  it('shows "Not started" when items and criteria exist but the user has not ranked', async () => {
    const item = Item.make('Apple', 'i-1');
    const dim = RankDimension.make('Quality', 'Lo', 'Hi', 'ascending', 'd-1');
    await setupProgressSession({ items: [item], dimensions: [dim] });
    const notStarted = await screen.findAllByText(/Not started/i);
    expect(notStarted.length).toBe(2);
  });

  it('shows "Ranked" when every position is filled', async () => {
    const apple = Item.make('Apple', 'i-1');
    const banana = Item.make('Banana', 'i-2');
    const dim = RankDimension.make('Quality', 'Lo', 'Hi', 'ascending', 'd-1');
    const { alice } = await setupProgressSession({
      items: [apple, banana],
      dimensions: [dim],
      rankingsByUser: { 'u-alice': { 'd-1': ['i-1', 'i-2'] } },
    });
    expect(alice.id).toBe('u-alice');
    const ranked = await screen.findByLabelText('All rankings complete');
    expect(ranked.textContent).toMatch(/Ranked/);
  });

  it('shows "X / Y" when partially ranked', async () => {
    const apple = Item.make('Apple', 'i-1');
    const banana = Item.make('Banana', 'i-2');
    const dim1 = RankDimension.make('Q', 'Lo', 'Hi', 'ascending', 'd-1');
    const dim2 = RankDimension.make('R', 'Lo', 'Hi', 'ascending', 'd-2');
    await setupProgressSession({
      items: [apple, banana],
      dimensions: [dim1, dim2],
      rankingsByUser: { 'u-alice': { 'd-1': ['i-1', 'i-2'] } },
    });
    const partial = await screen.findByLabelText('2 of 4 ranked');
    expect(partial.textContent?.replace(/\s+/g, ' ').trim()).toBe('2 / 4');
  });
});

async function setupSessionWithItems(items: Item[]) {
  const alice = User.make('Alice', 'u-alice');
  const documentId = await createSession();
  const handle = await loadDocHandle(documentId);
  handle.change((d) => {
    d.users.push(alice);
    d.items.push(...items);
  });

  localStorage.setItem(NAVIGATOR_NAME_KEY, JSON.stringify('Alice'));
  localStorage.setItem(NAVIGATOR_ID_KEY, JSON.stringify(alice.id));

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

describe('Configure / Items bulk-edit', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('toggles into bulk mode and pre-fills the textarea with current labels', async () => {
    const apple = Item.make('Apple', 'i-apple');
    const banana = Item.make('Banana', 'i-banana');
    await setupSessionWithItems([apple, banana]);

    fireEvent.click(
      await screen.findByRole('button', { name: /Edit as list/ }),
    );

    const textarea = (await screen.findByLabelText(
      /Items, one per line/,
    )) as HTMLTextAreaElement;
    expect(textarea.value).toBe('Apple\nBanana');
    expect(screen.queryByPlaceholderText(/Add an item/)).toBeNull();
    expect(screen.queryByLabelText(/Remove Apple/)).toBeNull();
  });

  it('saves an unchanged textarea without changing item ids', async () => {
    const apple = Item.make('Apple', 'i-apple');
    const banana = Item.make('Banana', 'i-banana');
    const { handle } = await setupSessionWithItems([apple, banana]);

    fireEvent.click(
      await screen.findByRole('button', { name: /Edit as list/ }),
    );
    fireEvent.click(await screen.findByRole('button', { name: /Save list/ }));

    await waitFor(() => {
      expect((handle.doc() as State).items.map((i) => i.id)).toEqual([
        apple.id,
        banana.id,
      ]);
    });
  });

  it('saves an edited list (add, remove, reorder)', async () => {
    const apple = Item.make('Apple', 'i-apple');
    const banana = Item.make('Banana', 'i-banana');
    const cherry = Item.make('Cherry', 'i-cherry');
    const { handle } = await setupSessionWithItems([apple, banana, cherry]);

    fireEvent.click(
      await screen.findByRole('button', { name: /Edit as list/ }),
    );
    const textarea = (await screen.findByLabelText(
      /Items, one per line/,
    )) as HTMLTextAreaElement;
    fireEvent.change(textarea, {
      target: { value: 'Cherry\nApple\nDate\n   \nApple' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Save list/ }));

    await waitFor(() => {
      const items = (handle.doc() as State).items;
      expect(items.map((i) => i.label)).toEqual(['Cherry', 'Apple', 'Date']);
      expect(items[0]!.id).toBe(cherry.id);
      expect(items[1]!.id).toBe(apple.id);
      expect(items[2]!.id).not.toBe(banana.id);
    });
    expect(screen.queryByLabelText(/Items, one per line/)).toBeNull();
  });

  it('Cmd/Ctrl+Enter inside the textarea saves the list', async () => {
    const apple = Item.make('Apple', 'i-apple');
    const { handle } = await setupSessionWithItems([apple]);

    fireEvent.click(
      await screen.findByRole('button', { name: /Edit as list/ }),
    );
    const textarea = (await screen.findByLabelText(
      /Items, one per line/,
    )) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Apple\nBanana' } });
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true });

    await waitFor(() => {
      expect((handle.doc() as State).items.map((i) => i.label)).toEqual([
        'Apple',
        'Banana',
      ]);
    });
    expect(screen.queryByLabelText(/Items, one per line/)).toBeNull();
  });

  it('Cancel discards textarea edits and returns to list mode', async () => {
    const apple = Item.make('Apple', 'i-apple');
    const { handle } = await setupSessionWithItems([apple]);

    fireEvent.click(
      await screen.findByRole('button', { name: /Edit as list/ }),
    );
    const textarea = (await screen.findByLabelText(
      /Items, one per line/,
    )) as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: 'Banana' } });
    fireEvent.click(screen.getByRole('button', { name: /Cancel/ }));

    await waitFor(() => {
      expect(screen.queryByLabelText(/Items, one per line/)).toBeNull();
    });
    expect((handle.doc() as State).items.map((i) => i.id)).toEqual([apple.id]);
  });
});
