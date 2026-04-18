import { routeTree } from '@/routeTree.gen.ts';
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
    const sessionId = '01J23ZD5YVK05BTTKZ0027G6D2';
    const memoryHistory = createMemoryHistory({
      initialEntries: [`/session/${sessionId}`],
    });
    const router = createRouter({ routeTree, history: memoryHistory });

    render(<RouterProvider router={router} />);

    expect(await screen.findByLabelText('Username')).toBeTruthy();
  });

  it('redirects to the user page from the app root when no user is configured', async () => {
    const memoryHistory = createMemoryHistory({ initialEntries: ['/'] });
    const router = createRouter({ routeTree, history: memoryHistory });

    render(<RouterProvider router={router} />);

    expect(await screen.findByLabelText('Username')).toBeTruthy();
  });
});
