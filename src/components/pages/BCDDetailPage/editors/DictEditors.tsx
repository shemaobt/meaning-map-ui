import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import {
  FieldGroup,
  EditableInput,
  EditableTextarea,
  TagsInput,
  OtherKeysSection,
  DynamicField,
} from "./FieldPrimitives";
import { Button } from "../../../ui/button";

interface GenreContextEditorProps {
  data: unknown;
  setData: (val: unknown) => void;
}

const KNOWN_GENRE_KEYS = ["primary_genre", "sub_genres", "narrative_voice", "temporal_setting", "audience_positioning"];

export function GenreContextEditor({ data, setData }: GenreContextEditorProps) {
  const { t } = useTranslation();
  const ctx = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;

  const update = (field: string, value: unknown) => {
    setData({ ...ctx, [field]: value });
  };

  const primaryGenre = typeof ctx.primary_genre === "string" ? ctx.primary_genre : "";
  const subGenres = Array.isArray(ctx.sub_genres)
    ? (ctx.sub_genres as unknown[]).map(String)
    : typeof ctx.sub_genre === "string" && ctx.sub_genre
      ? [ctx.sub_genre]
      : [];
  const narrativeVoice = typeof ctx.narrative_voice === "string" ? ctx.narrative_voice : "";
  const temporalSetting = typeof ctx.temporal_setting === "string" ? ctx.temporal_setting : "";
  const audiencePositioning = typeof ctx.audience_positioning === "string" ? ctx.audience_positioning : "";

  const handleSubGenresChange = (tags: string[]) => {
    const next: Record<string, unknown> = { ...ctx, sub_genres: tags };
    delete next.sub_genre;
    setData(next);
  };

  const otherKeys = Object.keys(ctx).filter((k) => !KNOWN_GENRE_KEYS.includes(k));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label={t("fields.primaryGenre")}>
          <EditableInput
            value={primaryGenre}
            onChange={(val) => update("primary_genre", val)}
            placeholder={t("editors.placeholders.primaryGenre")}
          />
        </FieldGroup>
        <FieldGroup label={t("fields.subGenres")}>
          <TagsInput
            tags={subGenres}
            onChange={handleSubGenresChange}
            placeholder={t("editors.placeholders.addSubGenre")}
          />
        </FieldGroup>
      </div>

      <FieldGroup label={t("fields.narrativeVoice")}>
        <EditableInput
          value={narrativeVoice}
          onChange={(val) => update("narrative_voice", val)}
          placeholder={t("editors.placeholders.narrativeVoice")}
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label={t("fields.temporalSetting")}>
          <EditableInput
            value={temporalSetting}
            onChange={(val) => update("temporal_setting", val)}
            placeholder={t("editors.placeholders.temporalSetting")}
          />
        </FieldGroup>
        <FieldGroup label={t("fields.audiencePositioning")}>
          <EditableInput
            value={audiencePositioning}
            onChange={(val) => update("audience_positioning", val)}
            placeholder={t("editors.placeholders.audiencePositioning")}
          />
        </FieldGroup>
      </div>

      {otherKeys.map((key) => (
        <FieldGroup key={key} label={key.replace(/_/g, " ")}>
          <DynamicField value={ctx[key]} onChange={(next) => update(key, next)} />
        </FieldGroup>
      ))}
    </div>
  );
}

const KNOWN_MAINTENANCE_KEYS = new Set(["generation_notes", "known_limitations"]);

interface MaintenanceNotesEditorProps {
  data: unknown;
  setData: (val: unknown) => void;
}

export function MaintenanceNotesEditor({ data, setData }: MaintenanceNotesEditorProps) {
  const { t } = useTranslation();
  const notes = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;

  const update = (field: string, value: unknown) => {
    setData({ ...notes, [field]: value });
  };

  const generationNotes = typeof notes.generation_notes === "string" ? notes.generation_notes : "";
  const knownLimitations = Array.isArray(notes.known_limitations)
    ? (notes.known_limitations as unknown[]).map(String)
    : [];

  return (
    <div className="space-y-4">
      <FieldGroup label={t("fields.generationNotes")}>
        <EditableTextarea
          value={generationNotes}
          onChange={(val) => update("generation_notes", val)}
          placeholder={t("editors.placeholders.generationNotes")}
          rows={3}
        />
      </FieldGroup>

      <FieldGroup label={t("fields.knownLimitations")}>
        <TagsInput
          tags={knownLimitations}
          onChange={(tags) => update("known_limitations", tags)}
          placeholder={t("editors.placeholders.addLimitation")}
        />
      </FieldGroup>

      <OtherKeysSection
        data={notes}
        knownKeys={KNOWN_MAINTENANCE_KEYS}
        onUpdate={update}
      />
    </div>
  );
}

interface KeyValueEditorProps {
  data: unknown;
  setData: (val: unknown) => void;
}

export function KeyValueEditor({ data, setData }: KeyValueEditorProps) {
  const { t } = useTranslation();
  const dict = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;
  const [newKey, setNewKey] = useState("");

  const update = (key: string, value: unknown) => {
    setData({ ...dict, [key]: value });
  };

  const remove = (key: string) => {
    const next = { ...dict };
    delete next[key];
    setData(next);
  };

  const addEntry = () => {
    const trimmed = newKey.trim();
    if (trimmed && !(trimmed in dict)) {
      setData({ ...dict, [trimmed]: "" });
      setNewKey("");
    }
  };

  const entries = Object.entries(dict);

  return (
    <div className="space-y-3">
      {entries.map(([key, val]) => (
        <div key={key} className="rounded-lg border border-areia/20 bg-surface px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-verde/50">
              {key.replace(/_/g, " ")}
            </span>
            <button
              type="button"
              onClick={() => remove(key)}
              className="text-verde/30 hover:text-telha transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <DynamicField value={val} onChange={(next) => update(key, next)} />

        </div>
      ))}

      <div className="flex items-center gap-2">
        <EditableInput
          value={newKey}
          onChange={setNewKey}
          placeholder={t("editors.placeholders.newKeyName")}
          className="flex-1"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addEntry}
          disabled={!newKey.trim()}
          className="gap-1 h-9"
        >
          <Plus className="h-3.5 w-3.5" />
          {t("editors.addEntry")}
        </Button>
      </div>
    </div>
  );
}
