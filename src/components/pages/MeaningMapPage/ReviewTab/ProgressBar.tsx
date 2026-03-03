import { useMeaningMapStore } from "../../../../stores/meaningMapStore";
import { Progress } from "../../../ui/progress";

export function ReviewProgressBar() {
  const { currentMap, reviewState } = useMeaningMapStore();
  if (!currentMap) return null;

  const data = currentMap.data;
  const totalSections =
    1 + // level 1
    data.level_2_scenes.length * 5 + // 5 subsections per scene
    1; // propositions

  const reviewedCount = Object.values(reviewState.reviewed).filter(Boolean).length;
  const progress = totalSections > 0 ? Math.round((reviewedCount / totalSections) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <Progress value={progress} className="flex-1" />
      <span className="text-xs font-medium text-verde whitespace-nowrap">
        {reviewedCount}/{totalSections} reviewed ({progress}%)
      </span>
    </div>
  );
}
