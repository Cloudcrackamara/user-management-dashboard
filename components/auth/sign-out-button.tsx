"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

export function SignOutButton() {
  const router = useRouter();

  function handleSignOut() {
    logout();
    router.replace(ROUTES.login);
  }

  return (
    <Button variant="secondary" onClick={handleSignOut}>
      Sign out
    </Button>
  );
}
