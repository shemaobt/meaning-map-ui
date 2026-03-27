import { useTranslation } from "react-i18next";
import { useMeaningMapStore } from "../../../../stores/meaningMapStore";
import { Progress } from "../../../ui/progress";

export function ReviewProgressBar() {
  const { t } = useTranslation();
  const sceneCount = useMeaningMapStore(
    (s) => s.currentMap?.data?.level_2_scenes?.length ?? 0
  );
  const reviewed = useMeaningMapStore((s) => s.reviewState.reviewed);

  const totalSections =
    1 + // level 1
    sceneCount * 5 + // 5 subsections per scene
    1; // propositions

  const reviewedCount = Object.values(reviewed).filter(Boolean).length;
  const progress = totalSections > 0 ? Math.round((reviewedCount / totalSections) * 100) : 0;

  return (
    <div className="bg-surface rounded-lg border border-areia/30 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-preto tracking-tight">{t("meaningMap.reviewProgress")}</span>
        <span className="text-xs font-medium text-verde">
          {t("meaningMap.progressCount", { reviewed: reviewedCount, total: totalSections, progress })}
        </span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
