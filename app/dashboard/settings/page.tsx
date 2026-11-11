import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Settings | User Management Dashboard",
};

export default function SettingsPage() {
  return (
    <PagePlaceholder
      title="Settings coming soon"
      description="Account and application preferences will appear here."
    />
  );
}
