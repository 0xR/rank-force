import { useSharedStore } from '@/routes/~session/~$sessionId/store.ts';
import { routeTree } from '@/routeTree.gen.ts';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { fireEvent, render, screen } from '@testing-library/react';

describe('UserPage', () => {
  it('should should store the user once', async () => {
    const memoryHistory = createMemoryHistory({
      initialEntries: ['/session/01J23ZD5YVK05BTTKZ0027G6D2/user'], // Pass your initial url
    });

    const router = createRouter({ routeTree, history: memoryHistory });

    render(<RouterProvider router={router} />);

    const userInput = await screen.findByLabelText('Username');
    fireEvent.change(userInput, {
      target: { value: 'John' },
    });
    const saveButton = screen.getByRole('button', { name: 'Save' });
    fireEvent.click(saveButton);
    fireEvent.click(saveButton);

    let users = useSharedStore.getState?.().users;
    expect(users).toHaveLength(1);
    expect(users![0]).toHaveProperty('name', 'John');
  });
});
