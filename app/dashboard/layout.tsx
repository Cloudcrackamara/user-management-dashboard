import { AuthGuard } from "@/components/auth/auth-guard";

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return <AuthGuard>{children}</AuthGuard>;
}
