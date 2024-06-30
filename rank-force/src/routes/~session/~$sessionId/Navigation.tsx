'use client';

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Route } from '@/routes/~session/~$sessionId.tsx';
import { createRoutePaths } from '@/routes/~session/~$sessionId/shared/route-paths';
import { Link, createLink } from '@tanstack/react-router';
import { PropsWithChildren } from 'react';

const MyLink = createLink((props) => <NavigationMenuLink {...props} />);

function NavigationLinkWithActive({
  href,
  children,
}: PropsWithChildren<{
  href: string;
}>) {
  return (
    <NavigationMenuItem>
      <MyLink
        from={Route.fullPath}
        to="./nking"
        className={navigationMenuTriggerStyle()}
      />
    </NavigationMenuItem>
  );
}

export function NavigationMenuDemo() {
  const params = Route.useParams();
  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationLinkWithActive
          href={createRoutePaths(params.sessionId).user}
        >
          User
        </NavigationLinkWithActive>
        <NavigationLinkWithActive
          href={createRoutePaths(params.sessionId).configure}
        >
          Configure
        </NavigationLinkWithActive>
        <NavigationLinkWithActive
          href={createRoutePaths(params.sessionId).ranking}
        >
          Ranking
        </NavigationLinkWithActive>
        <NavigationLinkWithActive
          href={createRoutePaths(params.sessionId).score}
        >
          Score
        </NavigationLinkWithActive>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
