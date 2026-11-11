"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { ErrorMessage } from "@/components/ui/error-message";
import { useUsers } from "@/hooks/useUsers";
import { cn } from "@/lib/cn";
import type { User } from "@/lib/schemas/user";

type UsersPanelProps = {
  title: string;
  /** Control shown opposite the title, e.g. a link. */
  action?: ReactNode;
  /** Shown while the users are loading. */
  skeleton: ReactNode;
  /** Renders the panel body once the users are available. */
  children: (users: User[]) => ReactNode;
  className?: string;
};

/**
 * Titled dashboard card fed by the users query. Handles the loading and
 * error states so each panel only describes its loaded content.
 */
export function UsersPanel({
  title,
  action,
  skeleton,
  children,
  className,
}: UsersPanelProps) {
  const { data: users, error, isFetching, refetch } = useUsers();
  const hasFailed = !users && error && !isFetching;

  return (
    <Card
      aria-busy={!users && !hasFailed ? true : undefined}
      className={cn("flex flex-col gap-4", className)}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h3>
        {action}
      </div>

      {users ? (
        children(users)
      ) : hasFailed ? (
        <ErrorMessage
          title={`Could not load ${title.toLowerCase()}`}
          message={error.message}
          onRetry={() => void refetch()}
        />
      ) : (
        <>
          <p className="sr-only">Loading {title.toLowerCase()}</p>
          {skeleton}
        </>
      )}
    </Card>
  );
}
