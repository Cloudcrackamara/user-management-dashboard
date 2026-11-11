import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/cn";
import type { RequestStatus } from "@/lib/request-status";

type StatusIndicatorProps = {
  status: RequestStatus;
  /** Timestamp (ms) of the last successful response, shown with data. */
  lastUpdatedAt?: number;
  /** Shown to screen readers alongside the Error label. */
  errorMessage?: string;
  /** Renders a Retry button in the error state. */
  onRetry?: () => void;
};

const STATUS_LABELS: Record<RequestStatus, string> = {
  idle: "Idle",
  loading: "Loading",
  refreshing: "Refreshing",
  success: "Success",
  error: "Error",
};

const STATUS_CLASSES: Record<RequestStatus, string> = {
  idle: "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400",
  loading:
    "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300",
  // Quieter than loading: data is already on screen.
  refreshing:
    "border-transparent bg-transparent text-zinc-500 dark:text-zinc-400",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  error:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
};

const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

/** Compact request status: a labelled pill, plus time or retry as relevant. */
export function StatusIndicator({
  status,
  lastUpdatedAt,
  errorMessage,
  onRetry,
}: StatusIndicatorProps) {
  const isInFlight = status === "loading" || status === "refreshing";
  // While refreshing, the time still describes the data on screen.
  const showLastUpdated =
    (status === "success" || status === "refreshing") &&
    lastUpdatedAt !== undefined;
  const showRetry = status === "error" && onRetry !== undefined;

  return (
    <div className="flex items-center gap-2">
      <p
        role="status"
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
          STATUS_CLASSES[status],
        )}
      >
        {isInFlight ? (
          <Spinner className="size-3" />
        ) : (
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-current"
          />
        )}
        <span className="sr-only">API status: </span>
        {STATUS_LABELS[status]}
        {status === "error" && errorMessage ? (
          <span className="sr-only">. {errorMessage}</span>
        ) : null}
        {showLastUpdated ? (
          <span className="hidden font-normal sm:inline">
            <span aria-hidden="true">· </span>
            Last updated{" "}
            <time dateTime={new Date(lastUpdatedAt).toISOString()}>
              {timeFormatter.format(lastUpdatedAt)}
            </time>
          </span>
        ) : null}
      </p>

      {showRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-xs font-medium text-zinc-900 transition-colors",
            "hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
          )}
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}
