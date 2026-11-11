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
