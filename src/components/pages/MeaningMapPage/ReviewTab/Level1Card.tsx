import { useMeaningMapStore } from "../../../../stores/meaningMapStore";
import { Textarea } from "../../../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { WarningsBlock } from "./WarningsBlock";
import { FeedbackThread } from "./FeedbackThread";
import { BookOpen } from "lucide-react";

interface Level1CardProps {
  readOnly?: boolean;
  mapId: string;
  showFeedback: boolean;
  canWriteFeedback: boolean;
  canResolveFeedback: boolean;
}

export function Level1Card({
  readOnly = false,
  mapId,
  showFeedback,
  canWriteFeedback,
  canResolveFeedback,
}: Level1CardProps) {
  const arc = useMeaningMapStore((s) => s.currentMap?.data?.level_1?.arc ?? "");
  const updateLevel1Arc = useMeaningMapStore((s) => s.updateLevel1Arc);
  const allWarnings = useMeaningMapStore((s) => s.reviewState.warnings);
  const warnings = allWarnings.filter((w) => w.section === "level_1");

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b border-areia/20">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-telha" />
          <CardTitle className="tracking-tight">Level 1 — The Arc</CardTitle>
        </div>
        <p className="text-xs text-verde/60">The overall narrative arc of the passage</p>
      </CardHeader>
      <CardContent className="space-y-3 pt-5">
        <Textarea
          value={arc}
          onChange={(e) => updateLevel1Arc(e.target.value)}
          readOnly={readOnly}
          rows={6}
          className="font-serif text-sm leading-relaxed"
          placeholder="The overall narrative arc of the passage..."
        />
        <WarningsBlock warnings={warnings} />
        {showFeedback && (
          <FeedbackThread
            mapId={mapId}
            sectionKey="level_1"
            canWrite={canWriteFeedback}
            canResolve={canResolveFeedback}
          />
        )}
      </CardContent>
    </Card>
  );
}
