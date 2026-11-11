import type { User } from "@/lib/schemas/user";

export type UserStats = {
  total: number;
  active: number;
  inactive: number;
  /** Number of distinct company names. */
  companies: number;
};

export function getUserStats(users: readonly User[]): UserStats {
  const active = users.filter((user) => user.status === "Active").length;
  const companies = new Set(users.map((user) => user.company.name)).size;

  return {
    total: users.length,
    active,
    inactive: users.length - active,
    companies,
  };
}

/** Whole-number percentage of `part` in `total`; 0 when `total` is 0. */
export function getPercentage(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

export type CityCount = {
  city: string;
  count: number;
};

/** Users per city, most users first; ties are ordered alphabetically. */
export function getCityCounts(users: readonly User[]): CityCount[] {
  const counts = new Map<string, number>();

  for (const user of users) {
    const city = user.address.city;
    counts.set(city, (counts.get(city) ?? 0) + 1);
  }

  return [...counts]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count || a.city.localeCompare(b.city));
}

/**
 * The API has no creation date, so "recent" means the highest ids,
 * newest first.
 */
export function getRecentUsers(users: readonly User[], limit: number): User[] {
  return [...users].sort((a, b) => b.id - a.id).slice(0, limit);
}
