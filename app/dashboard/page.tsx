import type { Metadata } from "next";
import { DashboardGreeting } from "@/components/dashboard/dashboard-greeting";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { RecentUsers } from "@/components/dashboard/recent-users";
import { UsersByCity } from "@/components/dashboard/users-by-city";

export const metadata: Metadata = {
  title: "Dashboard | User Management Dashboard",
};

const GREETING_HEADING_ID = "dashboard-greeting";

export default function DashboardPage() {
  return (
    <section
      aria-labelledby={GREETING_HEADING_ID}
      className="flex flex-col gap-4"
    >
      <DashboardGreeting headingId={GREETING_HEADING_ID} />
      <OverviewStats />
      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-3">
        <UsersByCity className="lg:col-span-2" />
        <RecentUsers />
      </div>
    </section>
  );
}
