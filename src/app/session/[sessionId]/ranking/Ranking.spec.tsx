import { createCompleteRankingAssignment } from '@/core/mock-factories';
import { deserializeJsonToYDoc } from '@/persistence/yjs-serialization';
import { fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import * as Y from 'yjs';
import Ranking from './Ranking';

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

  it('should show ranked items based on initial state', async () => {
    const testStore = createCompleteRankingAssignment();
    const plain = testStore.toPlainObject();
    const doc = deserializeJsonToYDoc(plain);

    const update = Y.encodeStateAsUpdate(doc);
    const updateBase64 = Buffer.from(update).toString('base64');

    render(<Ranking defaultValue={updateBase64} />);
    const lists = screen.getAllByRole('list').slice(-3);
    within(lists[1]).getByText('item1');
    within(lists[1]).getByText('item2');
    within(lists[1]).getByText('item3');
  });
});
