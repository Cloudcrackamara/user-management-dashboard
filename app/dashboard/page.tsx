import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Dashboard | User Management Dashboard",
};

export default function DashboardPage() {
  return (
    <PagePlaceholder
      title="Overview coming soon"
      description="Summary cards for your users will appear here."
    />
  );
}
