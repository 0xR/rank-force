import Page from '@/app/session/[sessionId]/page';
import { render, screen } from '@testing-library/react';
import { ulid } from 'ulid';

it('should render', async () => {
  const sessionId = ulid();
  render(
    await Page({
      params: { sessionId },
    }),
  );

  screen.debug();
});
