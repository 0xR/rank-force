'use client';

import { createRoutePaths } from '@/app/session/[sessionId]/route-paths';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import * as React from 'react';
import { PropsWithChildren } from 'react';

function NavigationLinkWithActive({
  href,
  children,
}: PropsWithChildren<{
  href: string;
}>) {
  const pathName = usePathname();
  return (
    <NavigationMenuItem>
      <Link href={href} legacyBehavior passHref>
        <NavigationMenuLink
          className={navigationMenuTriggerStyle()}
          active={pathName === href}
        >
          {children}
        </NavigationMenuLink>
      </Link>
    </NavigationMenuItem>
  );
}

export function NavigationMenuDemo() {
  const params = useParams();
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
