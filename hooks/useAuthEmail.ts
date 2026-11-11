"use client";

import { useSyncExternalStore } from "react";
import { getAuthEmail, subscribeToAuth } from "@/lib/auth";

function getServerAuthEmail(): string | null {
  return null;
}

/** Email of the signed-in visitor, kept in sync with localStorage. */
export function useAuthEmail(): string | null {
  return useSyncExternalStore(
    subscribeToAuth,
    getAuthEmail,
    getServerAuthEmail,
  );
}
