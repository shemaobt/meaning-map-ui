import { useMeaningMapStore } from "../../../../stores/meaningMapStore";
import { Textarea } from "../../../ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { WarningsBlock } from "./WarningsBlock";

interface Level1CardProps {
  readOnly?: boolean;
}

export function Level1Card({ readOnly = false }: Level1CardProps) {
  const arc = useMeaningMapStore((s) => s.currentMap?.data.level_1?.arc || "");
  const updateLevel1Arc = useMeaningMapStore((s) => s.updateLevel1Arc);
  const warnings = useMeaningMapStore((s) =>
    s.reviewState.warnings.filter((w) => w.section === "level_1")
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Level 1 — The Arc</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={arc}
          onChange={(e) => updateLevel1Arc(e.target.value)}
          readOnly={readOnly}
          rows={6}
          className="font-serif text-sm leading-relaxed"
          placeholder="The overall narrative arc of the passage..."
        />
        <WarningsBlock warnings={warnings} />
      </CardContent>
    </Card>
  );
}
