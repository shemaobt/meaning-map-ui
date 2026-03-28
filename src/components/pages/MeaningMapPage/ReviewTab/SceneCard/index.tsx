import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
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

function usePeopleFields() {
  const { t } = useTranslation();
  return [
    { key: "name" as const, label: t("fields.name") },
    { key: "role" as const, label: t("fields.role") },
    { key: "relationship" as const, label: t("fields.relationship") },
    { key: "wants" as const, label: t("fields.wants") },
    { key: "carries" as const, label: t("fields.carries") },
  ];
}

function usePlacesFields() {
  const { t } = useTranslation();
  return [
    { key: "name" as const, label: t("fields.name") },
    { key: "role" as const, label: t("fields.role") },
    { key: "type" as const, label: t("fields.type") },
    { key: "meaning" as const, label: t("fields.meaning") },
    { key: "effect_on_scene" as const, label: t("fields.effectOnScene") },
  ];
}

function useObjectsFields() {
  const { t } = useTranslation();
  return [
    { key: "name" as const, label: t("fields.name") },
    { key: "what_it_is" as const, label: t("fields.whatItIs") },
    { key: "function_in_scene" as const, label: t("fields.functionInScene") },
    { key: "signals" as const, label: t("fields.signals") },
  ];
}

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
  const { t } = useTranslation();
  const PEOPLE_FIELDS = usePeopleFields();
  const PLACES_FIELDS = usePlacesFields();
  const OBJECTS_FIELDS = useObjectsFields();
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
            {t("meaningMap.sceneTitle", { number: scene.scene_number, verses: scene.verses })}
          </CardTitle>
        </div>
        <div className="mt-1">
          <Input
            value={scene.title}
            onChange={handleTitleChange}
            readOnly={readOnly}
            placeholder={t("meaningMap.sceneTitlePlaceholder")}
            className="text-sm h-8"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        <section>
          <SectionLabel label={t("meaningMap.section2A")} />
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
          <SectionLabel label={t("meaningMap.section2B")} />
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
          <SectionLabel label={t("meaningMap.section2C")} />
          <EntryEditor<ObjectEntry>
            entries={scene.objects ?? []}
            fields={OBJECTS_FIELDS}
            onChange={handleObjectsChange}
            readOnly={readOnly}
            emptyFactory={() => ({ name: "", what_it_is: "", function_in_scene: "", signals: "" })}
          />
          <div className="mt-3">
            <label className="text-xs font-medium text-verde">{t("meaningMap.significantAbsence")}</label>
            <Textarea
              value={scene.significant_absence || ""}
              onChange={handleAbsenceChange}
              readOnly={readOnly}
              rows={2}
              className="mt-1 text-sm font-serif leading-relaxed"
              placeholder={t("meaningMap.significantAbsencePlaceholder")}
            />
          </div>
          {showFeedback && (
            <FeedbackThread sectionKey={`${prefix}_objects`} {...feedbackProps} />
          )}
        </section>

        <section>
          <SectionLabel label={t("meaningMap.whatHappensLabel")} />
          <Textarea
            value={scene.what_happens || ""}
            onChange={handleWhatHappensChange}
            readOnly={readOnly}
            rows={4}
            className="font-serif text-sm leading-relaxed"
            placeholder={t("meaningMap.whatHappensPlaceholder")}
          />
          {showFeedback && (
            <FeedbackThread sectionKey={`${prefix}_what_happens`} {...feedbackProps} />
          )}
        </section>

        <section>
          <SectionLabel label={t("meaningMap.communicativePurposeLabel")} />
          <Textarea
            value={scene.communicative_purpose || ""}
            onChange={handlePurposeChange}
            readOnly={readOnly}
            rows={3}
            className="font-serif text-sm leading-relaxed"
            placeholder={t("meaningMap.purposePlaceholder")}
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
