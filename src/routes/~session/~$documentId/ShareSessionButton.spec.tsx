import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ShareSessionButton } from './ShareSessionButton';

describe('ShareSessionButton', () => {
  const url = 'https://rank-force.example/session/doc-abc';

  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
  });

  it('writes the session URL to the clipboard on click', async () => {
    render(<ShareSessionButton url={url} />);
    fireEvent.click(screen.getByRole('button', { name: /share session/i }));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(url);
    });
  });

  it('shows a "Copied" confirmation, then reverts', async () => {
    render(<ShareSessionButton url={url} feedbackMs={50} />);
    fireEvent.click(screen.getByRole('button', { name: /share session/i }));

    expect(await screen.findByText(/copied/i)).toBeTruthy();

    await waitFor(() => {
      expect(screen.queryByText(/copied/i)).toBeNull();
    });
    expect(screen.getByText(/share/i)).toBeTruthy();
  });
});
