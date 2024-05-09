import Page from '@/app/session/[sessionId]/page';
import { render } from '@testing-library/react';

vi.mock('sst', () => ({
  Resource: {
    Table: {
      name: 'mock-table-name',
    },
  },
}));

it('should render', async () => {
  render(
    await Page({
      params: { sessionId: '01HXE9KWN5N17PGZD2HDDQB1EH' },
    }),
  );
});
