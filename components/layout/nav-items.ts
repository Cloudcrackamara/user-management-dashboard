import type { ComponentType } from "react";
import {
  DashboardIcon,
  SettingsIcon,
  UsersIcon,
  type IconProps,
} from "@/components/ui/icons";
import { ROUTES } from "@/lib/routes";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
};

export const NAV_ITEMS: readonly NavItem[] = [
  { label: "Dashboard", href: ROUTES.dashboard, icon: DashboardIcon },
  { label: "Users", href: ROUTES.users, icon: UsersIcon },
  { label: "Settings", href: ROUTES.settings, icon: SettingsIcon },
];

/**
 * The dashboard root only matches exactly; otherwise it would also be
 * active on every nested route. Other items match their sub-routes too.
 */
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === ROUTES.dashboard) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getPageTitle(pathname: string): string {
  const activeItem = NAV_ITEMS.find((item) =>
    isNavItemActive(item.href, pathname),
  );

  return activeItem?.label ?? "Dashboard";
}
