import type { Metadata } from "next";
import { OverviewStats } from "@/components/dashboard/overview-stats";

export const metadata: Metadata = {
  title: "Dashboard | User Management Dashboard",
};

export default function DashboardPage() {
  return (
    <section aria-labelledby="overview-heading" className="flex flex-col gap-4">
      <div className="flex flex-col gap-0.5">
        <h2
          id="overview-heading"
          className="text-base font-semibold text-zinc-900 dark:text-zinc-50"
        >
          Overview
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          A summary of the users in your workspace.
        </p>
      </div>
      <OverviewStats />
    </section>
  );
}
