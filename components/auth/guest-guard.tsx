"use client";

import type { ReactNode } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { ROUTES } from "@/lib/routes";

type GuestGuardProps = {
  children: ReactNode;
};

/** Renders children only for signed-out visitors; others go to /dashboard. */
export function GuestGuard({ children }: GuestGuardProps) {
  const status = useAuthRedirect({ authenticated: ROUTES.dashboard });

  if (status !== "unauthenticated") {
    return <PageLoader label="Checking your session" />;
  }

  return children;
}
