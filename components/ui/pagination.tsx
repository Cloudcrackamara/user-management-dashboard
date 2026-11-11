import { cn } from "@/lib/cn";
import { getPageCount, getPageItems } from "@/lib/pagination";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

type PaginationProps = {
  /** Current 1-based page. */
  page: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

const PAGE_BUTTON_CLASSES = cn(
  "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border border-zinc-300 bg-white px-2.5 text-sm font-medium text-zinc-900 transition-colors",
  "hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800",
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-white dark:disabled:hover:bg-zinc-900",
);

const CURRENT_PAGE_CLASSES =
  "border-indigo-600 bg-indigo-600 text-white hover:bg-indigo-600 dark:border-indigo-500 dark:bg-indigo-500 dark:text-white dark:hover:bg-indigo-500";

export function Pagination({
  page,
  pageSize,
  totalItems,
  onPageChange,
}: PaginationProps) {
  const pageCount = getPageCount(totalItems, pageSize);
  const firstItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastItem = Math.min(page * pageSize, totalItems);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between"
    >
      <p
        aria-live="polite"
        className="text-sm text-zinc-600 dark:text-zinc-400"
      >
        Showing {firstItem}–{lastItem} of {totalItems}
      </p>

      <ul className="flex flex-wrap items-center justify-center gap-1.5">
        <li>
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className={PAGE_BUTTON_CLASSES}
          >
            <ChevronLeftIcon className="size-4" />
            <span className="hidden sm:inline">Previous</span>
          </button>
        </li>

        {getPageItems(page, pageCount).map((item) =>
          typeof item === "number" ? (
            <li key={item}>
              <button
                type="button"
                onClick={() => onPageChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                className={cn(
                  PAGE_BUTTON_CLASSES,
                  item === page && CURRENT_PAGE_CLASSES,
                )}
              >
                {item}
              </button>
            </li>
          ) : (
            <li
              key={item}
              aria-hidden="true"
              className="px-1 text-sm text-zinc-500"
            >
              …
            </li>
          ),
        )}

        <li>
          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label="Next page"
            className={PAGE_BUTTON_CLASSES}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRightIcon className="size-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
