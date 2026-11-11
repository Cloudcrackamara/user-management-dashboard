"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { User } from "@/lib/schemas/user";
import { getCityCounts, getPercentage, getUserStats } from "@/lib/user-stats";
import { UsersPanel } from "./users-panel";

const SKELETON_BAR_WIDTHS = ["w-full", "w-4/5", "w-3/5", "w-2/5", "w-1/4"];

function pluralizeUsers(count: number): string {
  return `${count} ${count === 1 ? "user" : "users"}`;
}

type CityBarsProps = {
  users: readonly User[];
};

/** One horizontal bar per city, scaled against the largest city. */
function CityBars({ users }: CityBarsProps) {
  const cityCounts = getCityCounts(users);
  const maxCount = Math.max(...cityCounts.map(({ count }) => count));

  return (
    <ul className="flex flex-col gap-2.5">
      {cityCounts.map(({ city, count }) => (
        <li
          key={city}
          title={`${city}: ${pluralizeUsers(count)}`}
          className="grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)_1.5rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)_1.5rem]"
        >
          <span className="truncate text-zinc-600 dark:text-zinc-400">
            {city}
          </span>
          <span aria-hidden="true" className="flex h-2.5">
            <span
              className="min-w-1 rounded-r-sm bg-indigo-500"
              style={{ width: `${getPercentage(count, maxCount)}%` }}
            />
          </span>
          <span className="text-right font-medium text-zinc-900 tabular-nums dark:text-zinc-50">
            {count}
            <span className="sr-only"> {count === 1 ? "user" : "users"}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

type StatusSplitProps = {
  users: readonly User[];
};

/** Stacked bar of Active against Inactive, with a legend. */
function StatusSplit({ users }: StatusSplitProps) {
  const { total, active, inactive } = getUserStats(users);
  const activePercent = getPercentage(active, total);
  // Derived from the active share so the two always add up to 100.
  const inactivePercent = total === 0 ? 0 : 100 - activePercent;

  const segments = [
    {
      label: "Active",
      count: active,
      percent: activePercent,
      colorClass: "bg-emerald-700",
    },
    {
      label: "Inactive",
      count: inactive,
      percent: inactivePercent,
      colorClass: "bg-amber-600",
    },
  ];

  return (
    <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
      <h4 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
        Active vs Inactive
      </h4>

      <div
        role="img"
        aria-label={segments
          .map(({ label, percent }) => `${label} ${percent}%`)
          .join(", ")}
        className="flex h-3 gap-0.5 overflow-hidden rounded-sm"
      >
        {segments.map(({ label, count, percent, colorClass }) =>
          count > 0 ? (
            <span
              key={label}
              title={`${label}: ${percent}% (${pluralizeUsers(count)})`}
              className={colorClass}
              style={{ width: `${percent}%` }}
            />
          ) : null,
        )}
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {segments.map(({ label, count, percent, colorClass }) => (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`size-2.5 rounded-xs ${colorClass}`}
            />
            <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
            <span className="font-medium text-zinc-900 tabular-nums dark:text-zinc-50">
              {percent}%
            </span>
            <span className="text-zinc-500 tabular-nums dark:text-zinc-400">
              ({count})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function UsersByCitySkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2.5">
        {SKELETON_BAR_WIDTHS.map((width) => (
          <div key={width} className="flex items-center gap-3">
            <Skeleton className="h-4 w-24 shrink-0" />
            <div className="flex-1">
              <Skeleton className={`h-2.5 ${width}`} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-4 w-48" />
      </div>
    </div>
  );
}

type UsersByCityProps = {
  className?: string;
};

/** Bar chart of users per city, plus the Active/Inactive split. */
export function UsersByCity({ className }: UsersByCityProps) {
  return (
    <UsersPanel
      title="Users by City"
      skeleton={<UsersByCitySkeleton />}
      className={className}
    >
      {(users) =>
        users.length === 0 ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            No users to chart yet.
          </p>
        ) : (
          <>
            <CityBars users={users} />
            <StatusSplit users={users} />
          </>
        )
      }
    </UsersPanel>
  );
}
