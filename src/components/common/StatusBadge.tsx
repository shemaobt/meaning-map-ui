import { useTranslation } from "react-i18next";
import { Badge } from "../ui/badge";
import type { MeaningMapStatus } from "../../types/bible";

const STATUS_CONFIG: Record<string, { labelKey: string; variant: "draft" | "crossCheck" | "approved" }> = {
  draft: { labelKey: "status.draft", variant: "draft" },
  cross_check: { labelKey: "status.crossCheck", variant: "crossCheck" },
  approved: { labelKey: "status.approved", variant: "approved" },
};

interface StatusBadgeProps {
  status: MeaningMapStatus | null;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { t } = useTranslation();
  if (!status) return <Badge variant="default">{t("status.noMap")}</Badge>;
  const config = STATUS_CONFIG[status];
  if (!config) return null;
  return <Badge variant={config.variant}>{t(config.labelKey)}</Badge>;
}
