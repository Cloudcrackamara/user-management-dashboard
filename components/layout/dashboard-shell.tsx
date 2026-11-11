"use client";

import { usePathname } from "next/navigation";
import { useCallback, useId, useState, type ReactNode } from "react";
import { UsersStatusIndicator } from "@/components/status/users-status-indicator";
import { Brand } from "./brand";
import { Header } from "./header";
import { MobileDrawer } from "./mobile-drawer";
import { getPageTitle } from "./nav-items";
import { SidebarNav } from "./sidebar-nav";

const MAIN_CONTENT_ID = "main-content";

type DashboardShellProps = {
  children: ReactNode;
};

/** Sidebar on desktop, drawer on mobile, with a header above the page. */
export function DashboardShell({ children }: DashboardShellProps) {
  const pathname = usePathname();
  const drawerId = useId();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  return (
    <div className="flex flex-1 bg-zinc-50 dark:bg-black">
      <a
        href={`#${MAIN_CONTENT_ID}`}
        className="sr-only rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to content
      </a>

      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-zinc-200 bg-white lg:flex dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex h-16 shrink-0 items-center border-b border-zinc-200 px-4 dark:border-zinc-800">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          <SidebarNav />
        </div>
      </aside>

      <MobileDrawer
        id={drawerId}
        open={isDrawerOpen}
        onClose={closeDrawer}
        label="Navigation menu"
        header={<Brand />}
      >
        <SidebarNav onNavigate={closeDrawer} />
      </MobileDrawer>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={getPageTitle(pathname)}
          drawerId={drawerId}
          isDrawerOpen={isDrawerOpen}
          onOpenDrawer={openDrawer}
          status={<UsersStatusIndicator />}
        />
        <main id={MAIN_CONTENT_ID} tabIndex={-1} className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
