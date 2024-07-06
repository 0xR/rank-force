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
// @ts-expect-error TS6133
import { Link, createLink } from '@tanstack/react-router';
import { PropsWithChildren } from 'react';

// @ts-expect-error TS7006
const MyLink = createLink((props) => <NavigationMenuLink {...props} />);

// @ts-expect-error TS6198
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
        // @ts-expect-error TS2322
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
