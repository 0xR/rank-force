import { NavigationMenuDemo } from '@/routes/~session/~$sessionId/Navigation.tsx';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/session/$sessionId')({
  component() {
    return (
      <>
        <NavigationMenuDemo />
        <div className="flex flex-col gap-5 bg-gray-100 max-w-7xl mx-auto p-5">
          <Outlet />
        </div>
      </>
    );
  },
});
