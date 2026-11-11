import type { Metadata } from "next";
import { SignOutButton } from "@/components/auth/sign-out-button";

export const metadata: Metadata = {
  title: "Dashboard | User Management Dashboard",
};

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        You are signed in. Dashboard content coming soon.
      </p>
      <SignOutButton />
    </main>
  );
}
