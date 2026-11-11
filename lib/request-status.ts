import type { FetchStatus, QueryStatus } from "@tanstack/react-query";

export type RequestStatus = "idle" | "loading" | "success" | "error";

type QueryState = {
  status: QueryStatus;
  fetchStatus: FetchStatus;
};

/**
 * Collapses TanStack Query's two status fields into one UI status.
 * Any in-flight request (first load, retry, refetch) counts as loading;
 * "idle" means no result yet and nothing in flight (e.g. paused offline).
 */
export function getRequestStatus({
  status,
  fetchStatus,
}: QueryState): RequestStatus {
  if (fetchStatus === "fetching") {
    return "loading";
  }

  if (status === "pending") {
    return "idle";
  }

  return status;
}
