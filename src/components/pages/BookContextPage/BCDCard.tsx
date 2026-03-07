import { Link } from "react-router-dom";
import { Clock, Eye, FileText } from "lucide-react";
import type { BCDListItem } from "../../../types/bookContext";
import { BCDStatusBadge } from "./BCDStatusBadge";

interface BCDCardProps {
  bcd: BCDListItem;
}

export function BCDCard({ bcd }: BCDCardProps) {
  const updatedAt = new Date(bcd.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      to={`/app/book-context/${bcd.id}`}
      className="bg-surface rounded-lg border border-areia/30 shadow-sm p-4 transition-all duration-200 hover:shadow-md hover:border-telha/30 block"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-verde/50 flex-shrink-0" />
          <span className="text-sm font-semibold text-preto">
            Version {bcd.version}
          </span>
        </div>
        <BCDStatusBadge status={bcd.status} />
      </div>

      {bcd.section_label && (
        <p className="mt-2 text-xs text-verde/70">{bcd.section_label}</p>
      )}

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-areia/20 text-xs text-verde/60">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {updatedAt}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          View
        </span>
      </div>
    </Link>
  );
}
