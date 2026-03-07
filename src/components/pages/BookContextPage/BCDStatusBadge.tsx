import { cn } from "../../../utils/cn";
import type { BCDStatus } from "../../../types/bookContext";

const STATUS_STYLES: Record<BCDStatus, string> = {
  generating: "bg-amber-100 text-amber-800 border-amber-200",
  draft: "bg-areia/20 text-verde border-areia/40",
  review: "bg-azul/15 text-azul border-azul/30",
  approved: "bg-verde-claro/20 text-verde-claro border-verde-claro/30",
};

const STATUS_LABELS: Record<BCDStatus, string> = {
  generating: "Generating",
  draft: "Draft",
  review: "In Review",
  approved: "Approved",
};

interface BCDStatusBadgeProps {
  status: BCDStatus;
  className?: string;
}

export function BCDStatusBadge({ status, className }: BCDStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
        STATUS_STYLES[status],
        status === "generating" && "animate-pulse",
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
