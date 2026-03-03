import { Lock } from "lucide-react";
import { Badge } from "../ui/badge";

interface LockBadgeProps {
  lockedBy: string | null;
  lockedByName: string | null;
}

export function LockBadge({ lockedBy, lockedByName }: LockBadgeProps) {
  if (!lockedBy) return null;
  return (
    <Badge variant="locked" className="gap-1">
      <Lock className="h-3 w-3" />
      {lockedByName || "Locked"}
    </Badge>
  );
}
