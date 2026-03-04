import type { ChangeEvent } from "react";
import type { Scene, PersonEntry, PlaceEntry, ObjectEntry } from "../../../../../types/meaningMap";
import { useMeaningMapStore } from "../../../../../stores/meaningMapStore";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { Textarea } from "../../../../ui/textarea";
import { Input } from "../../../../ui/input";
import { EntryEditor } from "../EntryEditor";
import { WarningsBlock } from "../WarningsBlock";
import { FeedbackThread } from "../FeedbackThread";
import { Film } from "lucide-react";

interface SceneCardProps {
  scene: Scene;
  index: number;
  readOnly?: boolean;
  mapId: string;
  showFeedback: boolean;
  canWriteFeedback: boolean;
  canResolveFeedback: boolean;
}

const PEOPLE_FIELDS = [
  { key: "name" as const, label: "Name" },
  { key: "role" as const, label: "Role" },
  { key: "relationship" as const, label: "Relationship" },
  { key: "wants" as const, label: "Wants" },
  { key: "carries" as const, label: "Carries" },
];

const PLACES_FIELDS = [
  { key: "name" as const, label: "Name" },
  { key: "role" as const, label: "Role" },
  { key: "type" as const, label: "Type" },
  { key: "meaning" as const, label: "Meaning" },
  { key: "effect_on_scene" as const, label: "Effect on scene" },
];

const OBJECTS_FIELDS = [
  { key: "name" as const, label: "Name" },
  { key: "what_it_is" as const, label: "What it is" },
  { key: "function_in_scene" as const, label: "Function in scene" },
  { key: "signals" as const, label: "Signals" },
];

function SectionLabel({ label }: { label: string }) {
  return (
    <h5 className="text-xs font-semibold text-verde uppercase tracking-wide mb-2 flex items-center gap-2">
      <span className="h-px flex-1 bg-areia/30" />
      <span>{label}</span>
      <span className="h-px flex-1 bg-areia/30" />
    </h5>
  );
}

export function SceneCard({
  scene,
  index,
  readOnly = false,
  mapId,
  showFeedback,
  canWriteFeedback,
  canResolveFeedback,
}: SceneCardProps) {
  const prefix = `scene_${scene.scene_number}`;
  const allWarnings = useMeaningMapStore((s) => s.reviewState.warnings);
  const warnings = allWarnings.filter((w) => w.section.startsWith(prefix));

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) =>
    useMeaningMapStore.getState().updateSceneTitle(index, e.target.value);
  const handlePeopleChange = (people: PersonEntry[]) =>
    useMeaningMapStore.getState().updateScenePeople(index, people);
  const handlePlacesChange = (places: PlaceEntry[]) =>
    useMeaningMapStore.getState().updateScenePlaces(index, places);
  const handleObjectsChange = (objects: ObjectEntry[]) =>
    useMeaningMapStore.getState().updateSceneObjects(index, objects);
  const handleAbsenceChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    useMeaningMapStore.getState().updateSceneSignificantAbsence(index, e.target.value);
  const handleWhatHappensChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    useMeaningMapStore.getState().updateSceneWhatHappens(index, e.target.value);
  const handlePurposeChange = (e: ChangeEvent<HTMLTextAreaElement>) =>
    useMeaningMapStore.getState().updateScenePurpose(index, e.target.value);

  const feedbackProps = {
    mapId,
    canWrite: canWriteFeedback,
    canResolve: canResolveFeedback,
  };

  return (
    <Card className="shadow-md">
      <CardHeader className="border-b border-areia/20">
        <div className="flex items-center gap-2">
          <Film className="h-4 w-4 text-azul" />
          <CardTitle className="tracking-tight">
            Scene {scene.scene_number} — Verses {scene.verses}
          </CardTitle>
        </div>
        <div className="mt-1">
          <Input
            value={scene.title}
            onChange={handleTitleChange}
            readOnly={readOnly}
            placeholder="Scene title..."
            className="text-sm h-8"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        <section>
          <SectionLabel label="2A — People" />
          <EntryEditor<PersonEntry>
            entries={scene.people ?? []}
            fields={PEOPLE_FIELDS}
            onChange={handlePeopleChange}
            readOnly={readOnly}
            emptyFactory={() => ({ name: "", role: "", relationship: "", wants: "", carries: "" })}
          />
          {showFeedback && (
            <FeedbackThread sectionKey={`${prefix}_people`} {...feedbackProps} />
          )}
        </section>

        <section>
          <SectionLabel label="2B — Places" />
          <EntryEditor<PlaceEntry>
            entries={scene.places ?? []}
            fields={PLACES_FIELDS}
            onChange={handlePlacesChange}
            readOnly={readOnly}
            emptyFactory={() => ({ name: "", role: "", type: "", meaning: "", effect_on_scene: "" })}
          />
          {showFeedback && (
            <FeedbackThread sectionKey={`${prefix}_places`} {...feedbackProps} />
          )}
        </section>

        <section>
          <SectionLabel label="2C — Objects & Elements" />
          <EntryEditor<ObjectEntry>
            entries={scene.objects ?? []}
            fields={OBJECTS_FIELDS}
            onChange={handleObjectsChange}
            readOnly={readOnly}
            emptyFactory={() => ({ name: "", what_it_is: "", function_in_scene: "", signals: "" })}
          />
          <div className="mt-3">
            <label className="text-xs font-medium text-verde">Significant Absence</label>
            <Textarea
              value={scene.significant_absence || ""}
              onChange={handleAbsenceChange}
              readOnly={readOnly}
              rows={2}
              className="mt-1 text-xs font-serif"
              placeholder="Any notable absence..."
            />
          </div>
          {showFeedback && (
            <FeedbackThread sectionKey={`${prefix}_objects`} {...feedbackProps} />
          )}
        </section>

        <section>
          <SectionLabel label="2D — What Happens" />
          <Textarea
            value={scene.what_happens || ""}
            onChange={handleWhatHappensChange}
            readOnly={readOnly}
            rows={4}
            className="font-serif text-sm leading-relaxed"
            placeholder="Narrative of what happens in this scene..."
          />
          {showFeedback && (
            <FeedbackThread sectionKey={`${prefix}_what_happens`} {...feedbackProps} />
          )}
        </section>

        <section>
          <SectionLabel label="2E — Communicative Purpose" />
          <Textarea
            value={scene.communicative_purpose || ""}
            onChange={handlePurposeChange}
            readOnly={readOnly}
            rows={3}
            className="font-serif text-sm leading-relaxed"
            placeholder="Why this scene exists and what it establishes..."
          />
          {showFeedback && (
            <FeedbackThread sectionKey={`${prefix}_purpose`} {...feedbackProps} />
          )}
        </section>

        <WarningsBlock warnings={warnings} />
      </CardContent>
    </Card>
  );
}
