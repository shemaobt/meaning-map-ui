import { useTranslation } from "react-i18next";
import { useMeaningMapStore } from "../../../../stores/meaningMapStore";
import { meaningMapsAPI } from "../../../../services/api";
import { Button } from "../../../ui/button";
import { Level1Card } from "./Level1Card";
import { SceneCard } from "./SceneCard";
import { PropositionsCard } from "./PropositionsCard";
import { Send, CheckCircle, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ReviewTabProps {
  readOnly: boolean;
  actionsHidden: boolean;
  isCrossChecker: boolean;
  isAnalyst: boolean;
  onRefresh: () => void;
}

export function ReviewTab({
  readOnly,
  actionsHidden,
  isCrossChecker,
  isAnalyst,
  onRefresh,
}: ReviewTabProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const currentMap = useMeaningMapStore((s) => s.currentMap);
  const isDirty = useMeaningMapStore((s) => s.isDirty);
  const [saving, setSaving] = useState(false);

  if (!currentMap) {
    return (
      <p className="text-sm text-verde/50 text-center py-8">
        {t("meaningMap.noData")}
      </p>
    );
  }

  const { data, status } = currentMap;
  const dirty = isDirty();
  const showFeedback = true;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await meaningMapsAPI.update(currentMap.id, data, locale);
      useMeaningMapStore.getState().setFromBackend(updated);
      if (locale !== "en") {
        toast.success(t("meaningMap.saveTranslatedSuccess"));
      } else {
        toast.success(t("meaningMap.saveSuccess"));
      }
    } catch (err) {
      console.error("Save failed:", err);
      toast.error(t("meaningMap.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleSendToCrossCheck = async () => {
    try {
      await handleSave();
      const updated = await meaningMapsAPI.updateStatus(currentMap.id, "cross_check");
      useMeaningMapStore.getState().setFromBackend(updated);
      toast.success(t("meaningMap.sentToCrossCheck"));
      onRefresh();
    } catch {
      toast.error(t("meaningMap.crossCheckFailed"));
    }
  };

  const handleApprove = async () => {
    try {
      const updated = await meaningMapsAPI.updateStatus(currentMap.id, "approved");
      useMeaningMapStore.getState().setFromBackend(updated);
      toast.success(t("meaningMap.approvedToast"));
      onRefresh();
    } catch {
      toast.error(t("meaningMap.approveFailed"));
    }
  };

  const handleRequestRevisions = async () => {
    try {
      const updated = await meaningMapsAPI.updateStatus(currentMap.id, "draft");
      useMeaningMapStore.getState().setFromBackend(updated);
      toast.success(t("meaningMap.revisionsRequested"));
      onRefresh();
    } catch {
      toast.error(t("meaningMap.revisionsFailed"));
    }
  };

  return (
    <div className="space-y-6">
      {!actionsHidden && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {!readOnly && dirty && (
              <span className="flex items-center gap-1 text-xs font-medium text-telha">
                <AlertCircle className="h-3 w-3" />
                {t("meaningMap.unsavedChanges")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!readOnly && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleSave}
                disabled={saving || !dirty}
                className="gap-1"
              >
                <Save className="h-3 w-3" />
                {saving ? t("common.saving") : t("common.save")}
              </Button>
            )}
            {status === "draft" && isAnalyst && !readOnly && (
              <Button size="sm" onClick={handleSendToCrossCheck} className="gap-1">
                <Send className="h-3 w-3" /> {t("meaningMap.sendToCrossCheck")}
              </Button>
            )}
            {status === "cross_check" && isCrossChecker && (
              <>
                <Button size="sm" variant="outline" onClick={handleRequestRevisions}>
                  {t("meaningMap.requestRevisions")}
                </Button>
                <Button size="sm" onClick={handleApprove} className="gap-1">
                  <CheckCircle className="h-3 w-3" /> {t("common.approve")}
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      <Level1Card
        readOnly={readOnly}
        mapId={currentMap.id}
        showFeedback={showFeedback}
        canWriteFeedback={isCrossChecker}
        canResolveFeedback={isAnalyst}
      />

      {(data.level_2_scenes ?? []).map((scene, i) => (
        <SceneCard
          key={scene.scene_number}
          scene={scene}
          index={i}
          readOnly={readOnly}
          mapId={currentMap.id}
          showFeedback={showFeedback}
          canWriteFeedback={isCrossChecker}
          canResolveFeedback={isAnalyst}
        />
      ))}

      <PropositionsCard
        readOnly={readOnly}
        mapId={currentMap.id}
        showFeedback={showFeedback}
        canWriteFeedback={isCrossChecker}
        canResolveFeedback={isAnalyst}
      />
    </div>
  );
}
