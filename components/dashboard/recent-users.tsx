"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { UserStatusBadge } from "@/components/users/user-status-badge";
import { ROUTES } from "@/lib/routes";
import { getRecentUsers } from "@/lib/user-stats";
import { UsersPanel } from "./users-panel";

export const RECENT_USERS_LIMIT = 5;

function RecentUsersSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: RECENT_USERS_LIMIT }, (_, index) => (
        <div key={index} className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      ))}
    </div>
  );
}

type RecentUsersProps = {
  className?: string;
};

/** The five most recent users, with a link to the full list. */
export function RecentUsers({ className }: RecentUsersProps) {
  return (
    <UsersPanel
      title="Recent Users"
      action={
        <Link
          href={ROUTES.users}
          aria-label="View all users"
          className="rounded-md text-sm font-medium text-indigo-600 hover:text-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300"
        >
          View all
        </Link>
      }
      skeleton={<RecentUsersSkeleton />}
      className={className}
    >
      {(users) =>
        users.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No users yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {getRecentUsers(users, RECENT_USERS_LIMIT).map((user) => (
              <li key={user.id} className="flex items-center gap-3">
                <Avatar name={user.name} colorSeed={user.id} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    {user.name}
                  </span>
                  <span className="truncate text-xs text-zinc-500 dark:text-zinc-400">
                    {user.email}
                  </span>
                </div>
                <UserStatusBadge status={user.status} />
              </li>
            ))}
          </ul>
        )
      }
    </UsersPanel>
  );
}
