import { createFileRoute, redirect } from '@tanstack/react-router';
import { lazy, Suspense } from 'react';

const DevScenariosPage = import.meta.env.DEV
  ? lazy(() => import('@/dev/scenarios'))
  : null;

function DevRoute() {
  if (!DevScenariosPage) return null;
  return (
    <Suspense fallback={<div className="p-5">Loading…</div>}>
      <DevScenariosPage />
    </Suspense>
  );
}

export const Route = createFileRoute('/dev')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) {
      throw redirect({ to: '/' });
    }
  },
  component: DevRoute,
});
