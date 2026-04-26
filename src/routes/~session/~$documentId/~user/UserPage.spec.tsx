import { State } from '@/core/State';
import { createSession, loadDocHandle, repo } from '@/lib/repo';
import { routeTree } from '@/routeTree.gen.ts';
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
    const documentId = await createSession();
    const memoryHistory = createMemoryHistory({
      initialEntries: [`/session/${documentId}/user`],
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

    const handle = await loadDocHandle(documentId);

    await waitFor(() => {
      const users = (handle.doc() as State).users;
      expect(users).toHaveLength(1);
      expect(users[0]).toHaveProperty('name', 'John');
    });
  });
});
