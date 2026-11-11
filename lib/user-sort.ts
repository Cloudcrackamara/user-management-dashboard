import type { User } from "@/lib/schemas/user";

export type SortDirection = "asc" | "desc";

export function toggleSortDirection(direction: SortDirection): SortDirection {
  return direction === "asc" ? "desc" : "asc";
}

/** Returns a new array sorted by name; the input is not mutated. */
export function sortUsersByName(
  users: readonly User[],
  direction: SortDirection,
): User[] {
  const factor = direction === "asc" ? 1 : -1;

  return [...users].sort(
    (a, b) =>
      factor * a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
  );
}
