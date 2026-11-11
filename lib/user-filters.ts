import { USER_STATUSES, type User, type UserStatus } from "@/lib/schemas/user";

/** Filter value meaning "do not filter on this field". */
export const ALL = "";

export type StatusFilter = UserStatus | typeof ALL;

export type UserFilters = {
  /** Free text matched against name and email. */
  search: string;
  status: StatusFilter;
  /** Exact city name, or ALL. */
  city: string;
};

export const DEFAULT_USER_FILTERS: UserFilters = {
  search: "",
  status: ALL,
  city: ALL,
};

/** Narrows an arbitrary string (e.g. a select value) to a status filter. */
export function parseStatusFilter(value: string): StatusFilter {
  return USER_STATUSES.find((status) => status === value) ?? ALL;
}

export function hasActiveFilters(filters: UserFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.status !== ALL ||
    filters.city !== ALL
  );
}

/**
 * Returns the users matching every active filter. Search is a
 * case-insensitive substring match on name or email.
 */
export function filterUsers(
  users: readonly User[],
  { search, status, city }: UserFilters,
): User[] {
  const query = search.trim().toLowerCase();

  return users.filter((user) => {
    const matchesSearch =
      query === "" ||
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query);
    const matchesStatus = status === ALL || user.status === status;
    const matchesCity = city === ALL || user.address.city === city;

    return matchesSearch && matchesStatus && matchesCity;
  });
}

/** Distinct cities in the data, sorted alphabetically. */
export function getCityOptions(users: readonly User[]): string[] {
  const cities = new Set(users.map((user) => user.address.city));

  return [...cities].sort((a, b) => a.localeCompare(b));
}
