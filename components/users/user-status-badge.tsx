import { Badge, type BadgeTone } from "@/components/ui/badge";
import type { UserStatus } from "@/lib/schemas/user";

type UserStatusBadgeProps = {
  status: UserStatus;
};

const STATUS_TONES: Record<UserStatus, BadgeTone> = {
  Active: "success",
  Inactive: "neutral",
};

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return <Badge tone={STATUS_TONES[status]}>{status}</Badge>;
}
