import { Button } from "./button";

type ErrorMessageProps = {
  title: string;
  message: string;
  /** Renders a retry button when provided. */
  onRetry?: () => void;
};

export function ErrorMessage({ title, message, onRetry }: ErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-red-900 dark:bg-red-950"
    >
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-red-800 dark:text-red-200">
          {title}
        </p>
        <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry} className="shrink-0">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
