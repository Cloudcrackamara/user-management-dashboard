import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AUTH_EMAIL_KEY,
  AUTH_TOKEN_KEY,
  getAuthEmail,
  getAuthStatus,
  isAuthenticated,
  login,
  logout,
  subscribeToAuth,
} from "./auth";

const credentials = { email: "admin@example.com", password: "secret" };

afterEach(() => {
  window.localStorage.clear();
});

describe("auth", () => {
  it("is unauthenticated by default", () => {
    expect(isAuthenticated()).toBe(false);
    expect(getAuthStatus()).toBe("unauthenticated");
  });

  it("stores a mock token on login", async () => {
    await login(credentials, { latencyMs: 0 });

    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toMatch(/^mock-token-/);
    expect(isAuthenticated()).toBe(true);
    expect(getAuthStatus()).toBe("authenticated");
  });

  it("remembers the email while signed in", async () => {
    expect(getAuthEmail()).toBeNull();

    await login(credentials, { latencyMs: 0 });
    expect(getAuthEmail()).toBe("admin@example.com");

    logout();
    expect(getAuthEmail()).toBeNull();
    expect(window.localStorage.getItem(AUTH_EMAIL_KEY)).toBeNull();
  });

  it("removes the token on logout", async () => {
    await login(credentials, { latencyMs: 0 });

    logout();

    expect(window.localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    expect(isAuthenticated()).toBe(false);
  });

  it("notifies subscribers on login and logout until unsubscribed", async () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToAuth(listener);

    await login(credentials, { latencyMs: 0 });
    logout();
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    logout();
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("notifies subscribers when another tab changes the token", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToAuth(listener);

    window.dispatchEvent(new StorageEvent("storage", { key: AUTH_TOKEN_KEY }));
    window.dispatchEvent(new StorageEvent("storage", { key: "unrelated" }));

    expect(listener).toHaveBeenCalledOnce();
    unsubscribe();
  });
});
