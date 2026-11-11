"use client";

import type { ReactNode } from "react";
import { PageLoader } from "@/components/ui/page-loader";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { ROUTES } from "@/lib/routes";

type AuthGuardProps = {
  children: ReactNode;
};

/** Renders children only for signed-in visitors; others go to /login. */
export function AuthGuard({ children }: AuthGuardProps) {
  const status = useAuthRedirect({ unauthenticated: ROUTES.login });

  if (status !== "authenticated") {
    return <PageLoader label="Checking your session" />;
  }

  return children;
}
