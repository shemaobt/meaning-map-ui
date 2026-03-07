import { useState } from "react";
import { Plus, X } from "lucide-react";
import { FieldGroup, EditableInput, EditableTextarea, TagsInput } from "./FieldPrimitives";
import { Button } from "../../../ui/button";

// ─── Genre Context Editor ────────────────────────────────────────────────────

interface GenreContextEditorProps {
  data: unknown;
  setData: (val: unknown) => void;
}

export function GenreContextEditor({ data, setData }: GenreContextEditorProps) {
  const ctx = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;

  const update = (field: string, value: unknown) => {
    setData({ ...ctx, [field]: value });
  };

  const primaryGenre = typeof ctx.primary_genre === "string" ? ctx.primary_genre : "";
  const subGenre = typeof ctx.sub_genre === "string" ? ctx.sub_genre : "";
  const literaryFeatures = Array.isArray(ctx.literary_features) ? ctx.literary_features as string[] : [];

  const otherKeys = Object.keys(ctx).filter(
    (k) => !["primary_genre", "sub_genre", "literary_features"].includes(k)
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Primary Genre">
          <EditableInput
            value={primaryGenre}
            onChange={(val) => update("primary_genre", val)}
            placeholder="e.g. narrative, poetry, prophecy"
          />
        </FieldGroup>
        <FieldGroup label="Sub-Genre">
          <EditableInput
            value={subGenre}
            onChange={(val) => update("sub_genre", val)}
            placeholder="e.g. historical narrative, wisdom poetry"
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Literary Features">
        <TagsInput
          tags={literaryFeatures}
          onChange={(tags) => update("literary_features", tags)}
          placeholder="Add feature and press Enter"
        />
      </FieldGroup>

      {otherKeys.map((key) => {
        const val = ctx[key];
        return (
          <FieldGroup key={key} label={key.replace(/_/g, " ")}>
            {typeof val === "string" ? (
              <EditableTextarea
                value={val}
                onChange={(v) => update(key, v)}
                rows={2}
              />
            ) : Array.isArray(val) ? (
              <TagsInput
                tags={val.map(String)}
                onChange={(tags) => update(key, tags)}
              />
            ) : (
              <EditableInput
                value={String(val ?? "")}
                onChange={(v) => update(key, v)}
              />
            )}
          </FieldGroup>
        );
      })}
    </div>
  );
}

// ─── Key-Value Editor (Maintenance Notes, etc.) ──────────────────────────────

interface KeyValueEditorProps {
  data: unknown;
  setData: (val: unknown) => void;
}

export function KeyValueEditor({ data, setData }: KeyValueEditorProps) {
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
          {Array.isArray(val) ? (
            <TagsInput
              tags={val.map(String)}
              onChange={(tags) => update(key, tags)}
              placeholder="Add item and press Enter"
            />
          ) : (
            <EditableTextarea
              value={typeof val === "string" ? val : String(val ?? "")}
              onChange={(v) => update(key, v)}
              rows={2}
            />
          )}
        </div>
      ))}

      <div className="flex items-center gap-2">
        <EditableInput
          value={newKey}
          onChange={setNewKey}
          placeholder="New key name"
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
          Add
        </Button>
      </div>
    </div>
  );
}
