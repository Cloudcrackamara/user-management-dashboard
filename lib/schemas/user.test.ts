import { describe, expect, it } from "vitest";
import { buildApiUser } from "@/lib/test/fixtures";
import { apiUserSchema, deriveUserStatus, toUser } from "./user";

describe("apiUserSchema", () => {
  it("accepts a valid JSONPlaceholder user", () => {
    expect(apiUserSchema.safeParse(buildApiUser()).success).toBe(true);
  });

  it("rejects a user with an invalid email", () => {
    const result = apiUserSchema.safeParse(
      buildApiUser({ email: "not-an-email" }),
    );

    expect(result.success).toBe(false);
  });

  it("rejects a user with missing fields", () => {
    expect(apiUserSchema.safeParse({ id: 1, name: "Leanne" }).success).toBe(
      false,
    );
  });
});

describe("deriveUserStatus", () => {
  it("marks every third id as inactive", () => {
    expect([1, 2, 3, 4, 5, 6].map(deriveUserStatus)).toEqual([
      "Active",
      "Active",
      "Inactive",
      "Active",
      "Active",
      "Inactive",
    ]);
  });
});

describe("toUser", () => {
  it("adds the derived status without changing other fields", () => {
    const apiUser = buildApiUser({ id: 3 });

    expect(toUser(apiUser)).toEqual({ ...apiUser, status: "Inactive" });
  });
});
