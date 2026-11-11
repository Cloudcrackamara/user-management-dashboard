import type { FetchStatus, QueryStatus } from "@tanstack/react-query";

export type RequestStatus =
  "idle" | "loading" | "refreshing" | "success" | "error";

type QueryState = {
  status: QueryStatus;
  fetchStatus: FetchStatus;
  /** Whether a previous response is available to show meanwhile. */
  hasData: boolean;
};

/**
 * Collapses TanStack Query's state into one UI status. A request in flight
 * is "loading" when there is nothing to show yet (first fetch, or a retry
 * after a failed one) and "refreshing" when earlier data is still on
 * screen. "idle" means no result yet and nothing in flight (e.g. offline).
 */
export function getRequestStatus({
  status,
  fetchStatus,
  hasData,
}: QueryState): RequestStatus {
  if (fetchStatus === "fetching") {
    return hasData ? "refreshing" : "loading";
  }

  if (status === "pending") {
    return "idle";
  }

  return status;
}
