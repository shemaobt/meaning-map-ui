import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";
import type { StalenessResult } from "../../../types/bookContext";

interface StalenessBannerProps {
  staleness: StalenessResult;
  bcdVersionAtCreation?: number;
}

export function StalenessBanner({ staleness, bcdVersionAtCreation }: StalenessBannerProps) {
  const { t } = useTranslation();

  if (!staleness.is_stale) return null;

  const versionInfo =
    bcdVersionAtCreation != null && staleness.current_version != null
      ? ` (v${bcdVersionAtCreation} → v${staleness.current_version})`
      : "";

  return (
    <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800 dark:bg-amber-950/40 dark:border-amber-700/40 dark:text-amber-300">
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span>
        {t("meaningMap.stalenessBanner", { versionInfo })}
      </span>
    </div>
  );
}
