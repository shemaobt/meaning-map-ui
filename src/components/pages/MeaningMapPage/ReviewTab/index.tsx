import { useMeaningMapStore } from "../../../../stores/meaningMapStore";
import { useAuth } from "../../../../contexts/AuthContext";
import { meaningMapsAPI } from "../../../../services/api";
import { Button } from "../../../ui/button";
import { Level1Card } from "./Level1Card";
import { SceneCard } from "./SceneCard";
import { PropositionsCard } from "./PropositionsCard";
import { ReviewProgressBar } from "./ProgressBar";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface ReviewTabProps {
  readOnly: boolean;
  onRefresh: () => void;
}

export function ReviewTab({ readOnly, onRefresh }: ReviewTabProps) {
  const { user } = useAuth();
  const currentMap = useMeaningMapStore((s) => s.currentMap);
  const setFromBackend = useMeaningMapStore((s) => s.setFromBackend);
  const [saving, setSaving] = useState(false);

  if (!currentMap) {
    return (
      <p className="text-sm text-verde/50 text-center py-8">
        No data to review. Import or generate a meaning map first.
      </p>
    );
  }

  const { data, status, locked_by } = currentMap;
  const isOwner = locked_by === user?.id || currentMap.analyst_id === user?.id;
  const isCrossChecker = status === "cross_check" && locked_by === user?.id;

  const handleSave = async () => {
    setSaving(true);
    try {
      const updated = await meaningMapsAPI.update(currentMap.id, data);
      setFromBackend(updated);
      toast.success("Saved.");
    } catch {
      toast.error("Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleSendToCrossCheck = async () => {
    try {
      await handleSave();
      const updated = await meaningMapsAPI.updateStatus(currentMap.id, "cross_check");
      setFromBackend(updated);
      toast.success("Sent to cross-check.");
      onRefresh();
    } catch {
      toast.error("Failed to send to cross-check.");
    }
  };

  const handleApprove = async () => {
    try {
      const updated = await meaningMapsAPI.updateStatus(currentMap.id, "approved");
      setFromBackend(updated);
      toast.success("Approved!");
      onRefresh();
    } catch {
      toast.error("Failed to approve.");
    }
  };

  const handleRequestRevisions = async () => {
    try {
      const updated = await meaningMapsAPI.updateStatus(currentMap.id, "draft");
      setFromBackend(updated);
      toast.success("Returned to draft.");
      onRefresh();
    } catch {
      toast.error("Failed to request revisions.");
    }
  };

  return (
    <div className="space-y-6">
      <ReviewProgressBar />

      {!readOnly && (
        <div className="flex flex-wrap gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
          {status === "draft" && isOwner && (
            <Button size="sm" onClick={handleSendToCrossCheck} className="gap-1">
              <Send className="h-3 w-3" /> Send to Cross-check
            </Button>
          )}
          {status === "cross_check" && isCrossChecker && (
            <>
              <Button size="sm" variant="outline" onClick={handleRequestRevisions}>
                Request Revisions
              </Button>
              <Button size="sm" onClick={handleApprove} className="gap-1">
                <CheckCircle className="h-3 w-3" /> Approve
              </Button>
            </>
          )}
        </div>
      )}

      <Level1Card readOnly={readOnly} />

      {data.level_2_scenes.map((scene, i) => (
        <SceneCard key={scene.scene_number} scene={scene} index={i} readOnly={readOnly} />
      ))}

      <PropositionsCard readOnly={readOnly} />
    </div>
  );
}
