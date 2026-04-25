import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from '@/components/ui/navigation-menu';
import { navigationMenuTriggerStyle } from '@/components/ui/navigation-menu-variants';
import { Route } from '@/routes/~session/~$sessionId.tsx';
import { Link } from '@tanstack/react-router';
import { PropsWithChildren } from 'react';

function MyMenuItem({ to, children }: PropsWithChildren<{ to: string }>) {
  const params = Route.useParams();
  return (
    <NavigationMenuItem>
      <Link
        to={to}
        params={params}
        // @ts-expect-error _asChild is a runtime alias understood by TanStack Router but not typed
        _asChild={NavigationMenuLink}
        className={navigationMenuTriggerStyle()}
      >
        {children}
      </Link>
    </NavigationMenuItem>
  );
}

export function NavigationMenuDemo() {
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <MyMenuItem to="/session/$sessionId/user/">User</MyMenuItem>
        <MyMenuItem to="/session/$sessionId/configure/">Configure</MyMenuItem>
        <MyMenuItem to="/session/$sessionId/ranking/">Ranking</MyMenuItem>
        <MyMenuItem to="/session/$sessionId/score/">Score</MyMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
