"use client";

import { useUsers } from "@/hooks/useUsers";
import { getRequestStatus } from "@/lib/request-status";
import { StatusIndicator } from "./status-indicator";

/** StatusIndicator wired to the users query. */
export function UsersStatusIndicator() {
  const { status, fetchStatus, dataUpdatedAt, error, refetch } = useUsers();

  return (
    <StatusIndicator
      status={getRequestStatus({ status, fetchStatus })}
      lastUpdatedAt={dataUpdatedAt || undefined}
      errorMessage={error?.message}
      onRetry={() => void refetch()}
    />
  );
}
