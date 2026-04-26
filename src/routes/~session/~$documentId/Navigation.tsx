import { Wordmark } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import { Route } from '@/routes/~session/~$documentId.tsx';
import { useUserState } from '@/routes/~session/~$documentId/shared/useUser';
import { useRankAssignment } from '@/routes/~session/~$documentId/shared/UseRankAssignment';
import { Link, useMatchRoute } from '@tanstack/react-router';
import {
  Compass,
  Layers,
  LucideIcon,
  Telescope,
  UserCircle2,
} from 'lucide-react';
import { PropsWithChildren } from 'react';

const tabs = [
  { to: '/session/$documentId/configure', label: 'Configure', icon: Layers },
  { to: '/session/$documentId/ranking', label: 'Ranking', icon: Compass },
  { to: '/session/$documentId/score', label: 'Score', icon: Telescope },
] as const;

function TopTab({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: LucideIcon;
}) {
  const params = Route.useParams();
  const matchRoute = useMatchRoute();
  const isActive = !!matchRoute({ to: to as never, params: params as never });

  return (
    <Link
      to={to as never}
      params={params as never}
      className={cn(
        'group relative inline-flex items-center gap-2 h-12 px-4 text-sm font-medium transition-colors duration-150 ease-out-quart',
        'text-space-6 hover:text-cream',
        isActive && 'text-cream',
      )}
    >
      <Icon
        className={cn(
          'h-4 w-4 transition-colors duration-150 ease-out-quart',
          isActive ? 'text-cyan' : 'text-space-5 group-hover:text-space-6',
        )}
        strokeWidth={1.5}
      />
      {label}
      <span
        className={cn(
          'absolute inset-x-2 -bottom-px h-px bg-cyan transition-transform duration-200 ease-out-quart origin-center',
          isActive ? 'scale-x-100' : 'scale-x-0',
        )}
      />
    </Link>
  );
}

function NavigatorChip({
  name,
}: PropsWithChildren<{ name: string | undefined }>) {
  const params = Route.useParams();
  return (
    <Link
      to="/session/$documentId/user"
      params={params}
      className="inline-flex items-center gap-2 h-9 pl-2 pr-3 rounded-md text-cream hover:bg-space-2 transition-colors duration-150 ease-out-quart"
    >
      <UserCircle2 className="h-4 w-4 text-cyan" strokeWidth={1.5} />
      <span className="text-sm">
        {name ?? <span className="text-space-6">Set name</span>}
      </span>
    </Link>
  );
}

export function NavigationMenuDemo() {
  const rankAssignment = useRankAssignment();
  const [user] = useUserState(rankAssignment);

  return (
    <header className="border-b border-space-4 bg-space-0/90 backdrop-blur-sm sticky top-0 z-30">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between gap-4">
        <Link to="/" className="shrink-0">
          <Wordmark size="sm" />
        </Link>
        <nav aria-label="Session" className="hidden md:flex items-center gap-1">
          {tabs.map((t) => (
            <TopTab key={t.to} to={t.to} label={t.label} icon={t.icon} />
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <NavigatorChip name={user?.name} />
        </div>
      </div>
      <nav
        aria-label="Session"
        className="md:hidden border-t border-space-4 px-3 flex items-center justify-around"
      >
        {tabs.map((t) => (
          <TopTab key={t.to} to={t.to} label={t.label} icon={t.icon} />
        ))}
      </nav>
    </header>
  );
}

export function SessionShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-dvh bg-background">
      <NavigationMenuDemo />
      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
