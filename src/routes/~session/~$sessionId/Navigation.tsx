import { Wordmark } from '@/components/brand/Logo';
import { cn } from '@/lib/utils';
import { Route } from '@/routes/~session/~$sessionId.tsx';
import { useUserState } from '@/routes/~session/~$sessionId/shared/useUser';
import { useRankAssignment } from '@/routes/~session/~$sessionId/shared/UseRankAssignment';
import { Link, useMatchRoute } from '@tanstack/react-router';
import {
  Check,
  Compass,
  Copy,
  Layers,
  LucideIcon,
  Telescope,
  UserCircle2,
} from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

const tabs = [
  { to: '/session/$sessionId/configure', label: 'Configure', icon: Layers },
  { to: '/session/$sessionId/ranking', label: 'Ranking', icon: Compass },
  { to: '/session/$sessionId/score', label: 'Score', icon: Telescope },
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

function SessionCode({ sessionId }: { sessionId: string }) {
  const [copied, setCopied] = useState(false);
  const short = sessionId.slice(-6).toUpperCase();
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // best-effort; ignore.
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      className="group inline-flex items-center gap-2 h-9 pl-3 pr-2 rounded-md bg-space-1 border border-space-4 hover:border-cyan/60 transition-colors duration-150 ease-out-quart focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan"
      aria-label={copied ? 'Session link copied' : 'Copy session link'}
      title="Copy session link"
    >
      <span className="font-mono text-sm tracking-coord text-cream">
        {short}
      </span>
      <span className="ml-1 inline-flex items-center justify-center h-6 w-6 rounded text-space-6 group-hover:text-cream group-hover:bg-space-3">
        {copied ? (
          <Check className="h-3.5 w-3.5 text-cyan" strokeWidth={2} />
        ) : (
          <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />
        )}
      </span>
    </button>
  );
}

function NavigatorChip({
  name,
}: PropsWithChildren<{ name: string | undefined }>) {
  const params = Route.useParams();
  return (
    <Link
      to="/session/$sessionId/user"
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
  const params = Route.useParams();
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
          <SessionCode sessionId={params.sessionId} />
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
