"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth";
import { ROUTES } from "@/lib/routes";

type SignOutButtonProps = {
  className?: string;
};

export function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();

  function handleSignOut() {
    logout();
    router.replace(ROUTES.login);
  }

  return (
    <Button variant="secondary" onClick={handleSignOut} className={className}>
      Sign out
    </Button>
  );
}
