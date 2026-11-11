"use client";

import { useSyncExternalStore } from "react";
import { getAuthStatus, subscribeToAuth, type AuthStatus } from "@/lib/auth";

function getServerAuthStatus(): AuthStatus {
  return "loading";
}

/**
 * Current auth status, kept in sync with localStorage. Returns "loading"
 * on the server and during hydration so guards never redirect prematurely.
 */
export function useAuthStatus(): AuthStatus {
  return useSyncExternalStore(
    subscribeToAuth,
    getAuthStatus,
    getServerAuthStatus,
  );
}
