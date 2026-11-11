import type { ReactNode } from "react";
import { IconButton } from "@/components/ui/icon-button";
import { MenuIcon } from "@/components/ui/icons";
import { UserMenu } from "./user-menu";

type HeaderProps = {
  title: string;
  /** Id of the mobile drawer the menu button controls. */
  drawerId: string;
  isDrawerOpen: boolean;
  onOpenDrawer: () => void;
  /** Slot for the API request status indicator. */
  status?: ReactNode;
};

export function Header({
  title,
  drawerId,
  isDrawerOpen,
  onOpenDrawer,
  status,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-zinc-200 bg-white/90 px-3 backdrop-blur sm:px-6 dark:border-zinc-800 dark:bg-zinc-950/90">
      <IconButton
        aria-label="Open navigation menu"
        aria-expanded={isDrawerOpen}
        aria-controls={drawerId}
        onClick={onOpenDrawer}
        className="lg:hidden"
      >
        <MenuIcon />
      </IconButton>

      <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {title}
      </h1>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        {status}
        <UserMenu />
      </div>
    </header>
  );
}
