import { AlertTriangle } from "lucide-react";
import type { StalenessResult } from "../../../types/bookContext";

interface StalenessBannerProps {
  staleness: StalenessResult;
  bcdVersionAtCreation?: number;
}

export function StalenessBanner({ staleness, bcdVersionAtCreation }: StalenessBannerProps) {
  if (!staleness.is_stale) return null;

  return (
    <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>
        The Book Context Document has been updated since this map was created
        {bcdVersionAtCreation != null && staleness.current_version != null && (
          <> (v{bcdVersionAtCreation} → v{staleness.current_version})</>
        )}
        . Review the entry brief for changes.
      </span>
    </div>
  );
}
