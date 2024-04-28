import React from 'react';
import { screen, render, fireEvent } from '@testing-library/react';
import Ranking from './Ranking';
import { vi } from 'vitest';
import * as Y from 'yjs';

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('Ranking', () => {
  it('should output yjs state', () => {
    const onChange = vi.fn();
    render(<Ranking onChange={onChange} />);
    screen.getByText('Items');

    const itemInput = screen.getByLabelText('Item to rank:');
    fireEvent.change(itemInput, { target: { value: 'Item 1' } });
    fireEvent.click(screen.getByText('Add item'));

    expect(onChange).toHaveBeenCalled();
    let yDocUpdateBase64 = onChange.mock.calls[0][0];
    const update: Uint8Array = new Uint8Array(
      Buffer.from(yDocUpdateBase64, 'base64'),
    );
    const yDoc = new Y.Doc();
    Y.applyUpdate(yDoc, update);
    expect(yDoc.getMap('shared').toJSON()).toEqual({
      dimensions: [],
      users: [],
      items: [
        {
          id: expect.any(String),
          label: 'Item 1',
        },
      ],
      rankingsByUser: {},
    });
  });
});
