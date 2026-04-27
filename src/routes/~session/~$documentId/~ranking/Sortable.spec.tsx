import { Item } from '@/core/Item';
import { RankDimension } from '@/core/RankDimension';
import { Sortable } from '@/routes/~session/~$documentId/~ranking/Sortable';
import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';

const dimension = RankDimension.make(
  'Quality',
  'Worst',
  'Best',
  'ascending',
  'dim-1',
);

function Harness({ initialRanking = [] }: { initialRanking?: Item[] }) {
  const [items] = useState<Item[]>([
    Item.make('Apple', 'a'),
    Item.make('Banana', 'b'),
    Item.make('Cherry', 'c'),
  ]);
  const [ranked, setRanked] = useState<Item[]>(initialRanking);
  return (
    <>
      <Sortable
        items={items}
        onChange={setRanked}
        initialRanking={initialRanking}
        rankDimension={dimension}
      />
      <ol data-testid="committed">
        {ranked.map((i) => (
          <li key={i.id}>{i.label}</li>
        ))}
      </ol>
    </>
  );
}

describe('Sortable', () => {
  it('promotes an unranked item to the bottom of the ranked list when tapped', () => {
    render(<Harness />);

    fireEvent.click(screen.getByRole('button', { name: /Rank Apple/ }));
    fireEvent.click(screen.getByRole('button', { name: /Rank Cherry/ }));

    const committed = screen.getByTestId('committed');
    expect(committed.textContent).toBe('AppleCherry');
  });

  it('unranks a ranked item to the bottom of the unranked list via the × button', () => {
    const initial: Item[] = [
      { id: 'a', label: 'Apple' },
      { id: 'b', label: 'Banana' },
    ];
    render(<Harness initialRanking={initial} />);

    fireEvent.click(screen.getByRole('button', { name: /Unrank Apple/ }));

    expect(screen.getByTestId('committed').textContent).toBe('Banana');
    // Apple is now back in the unranked list (throws if missing)
    screen.getByRole('button', { name: /Rank Apple/ });
  });
});
