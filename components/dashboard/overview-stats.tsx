"use client";

import type { ComponentType } from "react";
import { ErrorMessage } from "@/components/ui/error-message";
import {
  BuildingIcon,
  UserCheckIcon,
  UsersIcon,
  UserXIcon,
  type IconProps,
} from "@/components/ui/icons";
import { useUsers } from "@/hooks/useUsers";
import { getUserStats, type UserStats } from "@/lib/user-stats";
import { StatCard, StatCardSkeleton, type StatCardTone } from "./stat-card";

type StatDefinition = {
  key: keyof UserStats;
  label: string;
  icon: ComponentType<IconProps>;
  tone: StatCardTone;
};

const STATS: readonly StatDefinition[] = [
  { key: "total", label: "Total Users", icon: UsersIcon, tone: "indigo" },
  {
    key: "active",
    label: "Active Users",
    icon: UserCheckIcon,
    tone: "emerald",
  },
  { key: "inactive", label: "Inactive Users", icon: UserXIcon, tone: "amber" },
  { key: "companies", label: "Companies", icon: BuildingIcon, tone: "sky" },
];

const GRID_CLASSES = "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4";

/** Overview figures derived from the users query. */
export function OverviewStats() {
  const { data: users, error, isFetching, refetch } = useUsers();

  // Cached data stays on screen even if a later refetch fails.
  if (users) {
    const stats = getUserStats(users);

    return (
      <dl className={GRID_CLASSES}>
        {STATS.map(({ key, label, icon, tone }) => (
          <StatCard
            key={key}
            label={label}
            value={stats[key]}
            icon={icon}
            tone={tone}
          />
        ))}
      </dl>
    );
  }

  if (error && !isFetching) {
    return (
      <ErrorMessage
        title="Could not load statistics"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div aria-busy="true" className={GRID_CLASSES}>
      <p className="sr-only">Loading statistics</p>
      {STATS.map(({ key }) => (
        <StatCardSkeleton key={key} />
      ))}
    </div>
  );
}
