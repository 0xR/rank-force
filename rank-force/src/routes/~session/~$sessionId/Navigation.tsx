import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Link } from '@tanstack/react-router';
import { PropsWithChildren } from 'react';

function MyMenuItem({ to, children }: PropsWithChildren<{ to: string }>) {
  return (
    <NavigationMenuItem>
      <Link
        to={to}
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
