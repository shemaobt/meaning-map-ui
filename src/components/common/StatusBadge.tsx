import { Badge } from "../ui/badge";
import type { MeaningMapStatus } from "../../types/bible";

const STATUS_CONFIG: Record<string, { label: string; variant: "draft" | "crossCheck" | "approved" }> = {
  draft: { label: "Draft", variant: "draft" },
  cross_check: { label: "Cross-check", variant: "crossCheck" },
  approved: { label: "Approved", variant: "approved" },
};

interface StatusBadgeProps {
  status: MeaningMapStatus | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return <Badge variant="default">No Map</Badge>;
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
