"use client";

import { PageLoader } from "@/components/ui/page-loader";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { ROUTES } from "@/lib/routes";

/** Entry point: sends visitors to the dashboard or the login screen. */
export default function HomePage() {
  useAuthRedirect({
    authenticated: ROUTES.dashboard,
    unauthenticated: ROUTES.login,
  });

  return <PageLoader label="Redirecting" />;
}
