/** Always at least 1, so an empty list still has a valid current page. */
export function getPageCount(totalItems: number, pageSize: number): number {
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

export function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(1, page), pageCount);
}

/** Returns the items on a 1-based page. */
export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number,
): T[] {
  const start = (page - 1) * pageSize;

  return items.slice(start, start + pageSize);
}

export type PageItem = number | "ellipsis-start" | "ellipsis-end";

/** Lists every page up to this count; longer ranges are truncated. */
const MAX_UNTRUNCATED_PAGES = 7;

/**
 * Page buttons to render: the first and last page, the current page with
 * one neighbour on each side, and ellipses for the gaps.
 */
export function getPageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= MAX_UNTRUNCATED_PAGES) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  const items: PageItem[] = [1];

  if (start > 2) {
    items.push("ellipsis-start");
  }

  for (let current = start; current <= end; current += 1) {
    items.push(current);
  }

  if (end < pageCount - 1) {
    items.push("ellipsis-end");
  }

  items.push(pageCount);

  return items;
}
