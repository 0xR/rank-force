import { createLazyFileRoute, Navigate } from '@tanstack/react-router';
import { ulid } from 'ulid';

export const Route = createLazyFileRoute('/')({
  component: () => (
    <Navigate
      to="/session/$sessionId"
      params={{
        sessionId: ulid(),
      }}
    />
  ),
});
