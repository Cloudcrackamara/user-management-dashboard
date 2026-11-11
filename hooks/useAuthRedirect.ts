"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { AuthStatus } from "@/lib/auth";
import { useAuthStatus } from "./useAuthStatus";

export type AuthRedirects = {
  /** Where to send signed-in visitors. Omit to let them stay. */
  authenticated?: string;
  /** Where to send signed-out visitors. Omit to let them stay. */
  unauthenticated?: string;
};

/**
 * Redirects based on auth status and returns that status so the caller can
 * decide what to render while the redirect is pending.
 */
export function useAuthRedirect({
  authenticated,
  unauthenticated,
}: AuthRedirects): AuthStatus {
  const status = useAuthStatus();
  const router = useRouter();

  const target =
    status === "authenticated"
      ? authenticated
      : status === "unauthenticated"
        ? unauthenticated
        : undefined;

  useEffect(() => {
    if (target) {
      router.replace(target);
    }
  }, [target, router]);

  return status;
}
