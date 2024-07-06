import { routeTree } from '@/routeTree.gen.ts';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';

describe('UserPage', () => {
  it('should render', async () => {
    const memoryHistory = createMemoryHistory({
      initialEntries: ['/session/01J23ZD5YVK05BTTKZ0027G6D2/user'], // Pass your initial url
    });

    const router = createRouter({ routeTree, history: memoryHistory });

    render(<RouterProvider router={router} />);

    await screen.findByLabelText('Username');

    screen.debug();
  });
});
