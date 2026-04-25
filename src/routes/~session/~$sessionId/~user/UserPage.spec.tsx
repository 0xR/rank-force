import { repo } from '@/lib/repo';
import { State } from '@/core/State';
import { routeTree } from '@/routeTree.gen.ts';
import { AutomergeUrl } from '@automerge/automerge-repo';
import { RepoContext } from '@automerge/automerge-repo-react-hooks';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

describe('UserPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should should store the user once', async () => {
    const sessionId = '01J23ZD5YVK05BTTKZ0027G6D2';
    const memoryHistory = createMemoryHistory({
      initialEntries: [`/session/${sessionId}/user`],
    });

    const router = createRouter({ routeTree, history: memoryHistory });

    render(
      <RepoContext.Provider value={repo}>
        <RouterProvider router={router} />
      </RepoContext.Provider>,
    );

    const userInput = await screen.findByLabelText('Your name');
    fireEvent.change(userInput, {
      target: { value: 'John' },
    });
    const saveButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(saveButton);

    const url = localStorage.getItem(
      `rank-force-${sessionId}-doc-url`,
    ) as AutomergeUrl | null;
    expect(url).not.toBeNull();
    const handle = await repo.find<State>(url!);

    await waitFor(() => {
      const users = handle.doc().users;
      expect(users).toHaveLength(1);
      expect(users[0]).toHaveProperty('name', 'John');
    });
  });
});
