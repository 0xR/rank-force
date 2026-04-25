import { createFileRoute, redirect } from '@tanstack/react-router';
import { ulid } from 'ulid';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      to: '/session/$sessionId',
      params: { sessionId: ulid() },
    });
  },
});
