import { apiUsersSchema, toUser, type User } from "@/lib/schemas/user";

export const USERS_ENDPOINT = "https://jsonplaceholder.typicode.com/users";

/** Artificial delay so loading states are visible against a fast API. */
export const SIMULATED_LATENCY_MS = 800;

/** Query parameter reviewers can add to the page URL to force a failure. */
export const FAIL_QUERY_PARAM = "fail";

export class UsersApiError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "UsersApiError";
  }
}

export type FetchUsersOptions = {
  signal?: AbortSignal;
  /** Overrides the simulated latency. Mainly useful in tests. */
  latencyMs?: number;
};

/** True when the current page URL contains `?fail=true`. */
export function shouldSimulateFailure(search?: string): boolean {
  const query =
    search ?? (typeof window === "undefined" ? "" : window.location.search);

  return new URLSearchParams(query).get(FAIL_QUERY_PARAM) === "true";
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export async function fetchUsers({
  signal,
  latencyMs = SIMULATED_LATENCY_MS,
}: FetchUsersOptions = {}): Promise<User[]> {
  await delay(latencyMs, signal);

  if (shouldSimulateFailure()) {
    throw new UsersApiError(
      "Simulated failure: remove ?fail=true from the URL to load users.",
    );
  }

  const response = await fetch(USERS_ENDPOINT, { signal });

  if (!response.ok) {
    throw new UsersApiError(`Failed to load users (HTTP ${response.status}).`);
  }

  const payload: unknown = await response.json();
  const result = apiUsersSchema.safeParse(payload);

  if (!result.success) {
    throw new UsersApiError("Received an unexpected response for users.", {
      cause: result.error,
    });
  }

  return result.data.map(toUser);
}
