import type { Metadata } from "next";
import { PagePlaceholder } from "@/components/layout/page-placeholder";

export const metadata: Metadata = {
  title: "Users | User Management Dashboard",
};

export default function UsersPage() {
  return (
    <PagePlaceholder
      title="User table coming soon"
      description="A searchable, sortable list of users will appear here."
    />
  );
}
