import type { Metadata } from "next";
import { UsersTable } from "@/components/users/users-table";

export const metadata: Metadata = {
  title: "Users | User Management Dashboard",
};

export default function UsersPage() {
  return (
    <section aria-labelledby="users-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h2
          id="users-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-50"
        >
          All users
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Everyone in your workspace and their current status.
        </p>
      </div>
      <UsersTable />
    </section>
  );
}
