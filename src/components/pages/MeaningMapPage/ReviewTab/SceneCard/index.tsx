import type { Scene, PersonEntry, PlaceEntry, ObjectEntry } from "../../../../../types/meaningMap";
import { useMeaningMapStore } from "../../../../../stores/meaningMapStore";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { Textarea } from "../../../../ui/textarea";
import { Input } from "../../../../ui/input";
import { EntryEditor } from "../EntryEditor";
import { WarningsBlock } from "../WarningsBlock";

interface SceneCardProps {
  scene: Scene;
  index: number;
  readOnly?: boolean;
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

export function SceneCard({ scene, index, readOnly = false }: SceneCardProps) {
  const store = useMeaningMapStore();
  const prefix = `scene_${scene.scene_number}`;
  const warnings = store.reviewState.warnings.filter((w) =>
    w.section.startsWith(prefix)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Scene {scene.scene_number} — Verses {scene.verses}
        </CardTitle>
        <div className="mt-1">
          <Input
            value={scene.title}
            onChange={(e) => store.updateSceneTitle(index, e.target.value)}
            readOnly={readOnly}
            placeholder="Scene title..."
            className="text-sm h-8"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <section>
          <h5 className="text-xs font-semibold text-verde uppercase tracking-wider mb-2">
            2A — People
          </h5>
          <EntryEditor<PersonEntry>
            entries={scene.people}
            fields={PEOPLE_FIELDS}
            onChange={(people) => store.updateScenePeople(index, people)}
            readOnly={readOnly}
            emptyFactory={() => ({ name: "", role: "", relationship: "", wants: "", carries: "" })}
          />
        </section>

        <section>
          <h5 className="text-xs font-semibold text-verde uppercase tracking-wider mb-2">
            2B — Places
          </h5>
          <EntryEditor<PlaceEntry>
            entries={scene.places}
            fields={PLACES_FIELDS}
            onChange={(places) => store.updateScenePlaces(index, places)}
            readOnly={readOnly}
            emptyFactory={() => ({ name: "", role: "", type: "", meaning: "", effect_on_scene: "" })}
          />
        </section>

        <section>
          <h5 className="text-xs font-semibold text-verde uppercase tracking-wider mb-2">
            2C — Objects & Elements
          </h5>
          <EntryEditor<ObjectEntry>
            entries={scene.objects}
            fields={OBJECTS_FIELDS}
            onChange={(objects) => store.updateSceneObjects(index, objects)}
            readOnly={readOnly}
            emptyFactory={() => ({ name: "", what_it_is: "", function_in_scene: "", signals: "" })}
          />
          <div className="mt-3">
            <label className="text-xs font-medium text-verde">Significant Absence</label>
            <Textarea
              value={scene.significant_absence || ""}
              onChange={(e) => store.updateSceneSignificantAbsence(index, e.target.value)}
              readOnly={readOnly}
              rows={2}
              className="mt-1 text-xs"
              placeholder="Any notable absence..."
            />
          </div>
        </section>

        <section>
          <h5 className="text-xs font-semibold text-verde uppercase tracking-wider mb-2">
            2D — What Happens
          </h5>
          <Textarea
            value={scene.what_happens || ""}
            onChange={(e) => store.updateSceneWhatHappens(index, e.target.value)}
            readOnly={readOnly}
            rows={4}
            className="font-serif text-sm"
            placeholder="Narrative of what happens in this scene..."
          />
        </section>

        <section>
          <h5 className="text-xs font-semibold text-verde uppercase tracking-wider mb-2">
            2E — Communicative Purpose
          </h5>
          <Textarea
            value={scene.communicative_purpose || ""}
            onChange={(e) => store.updateScenePurpose(index, e.target.value)}
            readOnly={readOnly}
            rows={3}
            className="font-serif text-sm"
            placeholder="Why this scene exists and what it establishes..."
          />
        </section>

        <WarningsBlock warnings={warnings} />
      </CardContent>
    </Card>
  );
}
