import type { Metadata } from "next";
import { GuestGuard } from "@/components/auth/guest-guard";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in | User Management Dashboard",
};

export default function LoginPage() {
  return (
    <GuestGuard>
      <main className="flex flex-1 items-center justify-center bg-zinc-50 p-4 sm:p-6 dark:bg-black">
        <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-950">
          <div className="mb-6 flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Sign in
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Demo login: any valid email and a password of 6 or more
              characters.
            </p>
          </div>
          <LoginForm />
        </div>
      </main>
    </GuestGuard>
  );
}
