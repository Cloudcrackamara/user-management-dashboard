import type { LoginCredentials } from "@/lib/schemas/auth";

/**
 * Mock authentication. A fake token in localStorage stands in for a session;
 * nothing here is secure and no credentials are checked against a server.
 */

export const AUTH_TOKEN_KEY = "umd.auth.token";

/** Artificial delay so the login button's loading state is visible. */
export const SIMULATED_AUTH_LATENCY_MS = 600;

const AUTH_CHANGE_EVENT = "umd:auth-change";

/** "loading" covers server rendering and hydration, before storage is read. */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type LoginOptions = {
  /** Overrides the simulated latency. Mainly useful in tests. */
  latencyMs?: number;
};

function notifyAuthChange(): void {
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
}

function createMockToken(): string {
  return `mock-token-${crypto.randomUUID()}`;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY) !== null;
  } catch {
    // Storage can be blocked (for example in some private browsing modes).
    return false;
  }
}

export function getAuthStatus(): AuthStatus {
  return isAuthenticated() ? "authenticated" : "unauthenticated";
}

/**
 * Accepts any credentials that pass form validation and stores a fake token.
 * Rejects if the token cannot be stored.
 */
export async function login(
  _credentials: LoginCredentials,
  { latencyMs = SIMULATED_AUTH_LATENCY_MS }: LoginOptions = {},
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, latencyMs));

  window.localStorage.setItem(AUTH_TOKEN_KEY, createMockToken());
  notifyAuthChange();
}

export function logout(): void {
  try {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch {
    // Nothing to remove if storage is unavailable.
  }

  notifyAuthChange();
}

/**
 * Subscribes to auth changes from this tab (login/logout) and from other
 * tabs (the storage event). Returns an unsubscribe function.
 */
export function subscribeToAuth(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === AUTH_TOKEN_KEY || event.key === null) {
      listener();
    }
  };

  window.addEventListener(AUTH_CHANGE_EVENT, listener);
  window.addEventListener("storage", onStorage);

  return () => {
    window.removeEventListener(AUTH_CHANGE_EVENT, listener);
    window.removeEventListener("storage", onStorage);
  };
}
