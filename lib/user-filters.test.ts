import { describe, expect, it } from "vitest";
import { toUser, type User } from "@/lib/schemas/user";
import { buildApiUser } from "@/lib/test/fixtures";
import {
  DEFAULT_USER_FILTERS,
  filterUsers,
  getCityOptions,
  hasActiveFilters,
  parseStatusFilter,
  type UserFilters,
} from "./user-filters";

function buildUser(
  id: number,
  name: string,
  email: string,
  city: string,
): User {
  const apiUser = buildApiUser({ id, name, email });

  return toUser({ ...apiUser, address: { ...apiUser.address, city } });
}

/** Id 3 is the only inactive user. */
const users: User[] = [
  buildUser(1, "Leanne Graham", "leanne@april.biz", "Gwenborough"),
  buildUser(2, "Ervin Howell", "ervin@melissa.tv", "Wisokyburgh"),
  buildUser(3, "Clementine Bauch", "clem@yesenia.net", "Gwenborough"),
  buildUser(4, "Patricia Lebsack", "graham.fan@kory.org", "South Elvis"),
];

function idsFor(filters: Partial<UserFilters>): number[] {
  return filterUsers(users, { ...DEFAULT_USER_FILTERS, ...filters }).map(
    (user) => user.id,
  );
}

describe("filterUsers", () => {
  it("returns every user with the default filters", () => {
    expect(idsFor({})).toEqual([1, 2, 3, 4]);
  });

  it("searches name and email, ignoring case and outer whitespace", () => {
    expect(idsFor({ search: "ervin" })).toEqual([2]);
    expect(idsFor({ search: "  GRAHAM " })).toEqual([1, 4]);
    expect(idsFor({ search: "yesenia.net" })).toEqual([3]);
  });

  it("does not search other fields", () => {
    expect(idsFor({ search: "Gwenborough" })).toEqual([]);
  });

  it("filters by status", () => {
    expect(idsFor({ status: "Active" })).toEqual([1, 2, 4]);
    expect(idsFor({ status: "Inactive" })).toEqual([3]);
  });

  it("filters by exact city", () => {
    expect(idsFor({ city: "Gwenborough" })).toEqual([1, 3]);
    expect(idsFor({ city: "Gwen" })).toEqual([]);
  });

  it("combines search and filters", () => {
    expect(idsFor({ search: "graham", status: "Active" })).toEqual([1, 4]);
    expect(
      idsFor({ search: "graham", status: "Active", city: "South Elvis" }),
    ).toEqual([4]);
    expect(idsFor({ status: "Inactive", city: "Wisokyburgh" })).toEqual([]);
  });

  it("does not mutate the input", () => {
    const original = [...users];

    filterUsers(users, { ...DEFAULT_USER_FILTERS, search: "ervin" });

    expect(users).toEqual(original);
  });
});

describe("getCityOptions", () => {
  it("returns distinct cities in alphabetical order", () => {
    expect(getCityOptions(users)).toEqual([
      "Gwenborough",
      "South Elvis",
      "Wisokyburgh",
    ]);
  });

  it("returns an empty list when there are no users", () => {
    expect(getCityOptions([])).toEqual([]);
  });
});

describe("hasActiveFilters", () => {
  it("is false for the defaults and whitespace-only search", () => {
    expect(hasActiveFilters(DEFAULT_USER_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...DEFAULT_USER_FILTERS, search: "  " })).toBe(
      false,
    );
  });

  it("is true when any filter is set", () => {
    expect(hasActiveFilters({ ...DEFAULT_USER_FILTERS, search: "a" })).toBe(
      true,
    );
    expect(
      hasActiveFilters({ ...DEFAULT_USER_FILTERS, status: "Active" }),
    ).toBe(true);
    expect(hasActiveFilters({ ...DEFAULT_USER_FILTERS, city: "Paris" })).toBe(
      true,
    );
  });
});

describe("parseStatusFilter", () => {
  it("accepts known statuses and falls back to all", () => {
    expect(parseStatusFilter("Active")).toBe("Active");
    expect(parseStatusFilter("Inactive")).toBe("Inactive");
    expect(parseStatusFilter("")).toBe("");
    expect(parseStatusFilter("Banned")).toBe("");
  });
});
