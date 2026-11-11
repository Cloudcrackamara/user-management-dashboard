import { describe, expect, it } from "vitest";
import { getLoginFieldErrors, loginSchema } from "./auth";

function errorsFor(input: { email: string; password: string }) {
  const result = loginSchema.safeParse(input);
  return result.success ? {} : getLoginFieldErrors(result.error);
}

describe("loginSchema", () => {
  it("accepts a valid email and a 6 character password", () => {
    const result = loginSchema.safeParse({
      email: "  admin@example.com ",
      password: "secret",
    });

    expect(result.success).toBe(true);
    expect(result.data?.email).toBe("admin@example.com");
  });

  it("reports required fields", () => {
    expect(errorsFor({ email: "", password: "" })).toEqual({
      email: "Email is required.",
      password: "Password is required.",
    });
  });

  it("reports an invalid email", () => {
    expect(errorsFor({ email: "admin@", password: "secret" })).toEqual({
      email: "Enter a valid email address.",
      password: undefined,
    });
  });

  it("reports a password shorter than 6 characters", () => {
    expect(
      errorsFor({ email: "admin@example.com", password: "12345" }),
    ).toEqual({
      email: undefined,
      password: "Password must be at least 6 characters.",
    });
  });
});
