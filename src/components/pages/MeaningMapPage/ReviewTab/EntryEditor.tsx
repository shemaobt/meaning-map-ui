import { useState } from "react";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { Pencil, Plus, Trash2, Check, X } from "lucide-react";

interface EntryEditorProps<T extends Record<string, string>> {
  entries: T[];
  fields: { key: keyof T & string; label: string }[];
  onChange: (entries: T[]) => void;
  readOnly?: boolean;
  emptyFactory: () => T;
}

export function EntryEditor<T extends Record<string, string>>({
  entries,
  fields,
  onChange,
  readOnly = false,
  emptyFactory,
}: EntryEditorProps<T>) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<T | null>(null);

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setDraft({ ...entries[i] });
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setDraft(null);
  };

  const saveEdit = () => {
    if (editingIndex === null || !draft) return;
    const updated = [...entries];
    updated[editingIndex] = draft;
    onChange(updated);
    cancelEdit();
  };

  const addEntry = () => {
    onChange([...entries, emptyFactory()]);
    setEditingIndex(entries.length);
    setDraft(emptyFactory());
  };

  const removeEntry = (i: number) => {
    onChange(entries.filter((_, idx) => idx !== i));
    if (editingIndex === i) cancelEdit();
  };

  return (
    <div className="space-y-2">
      {entries.map((entry, i) => (
        <div
          key={i}
          className="rounded border border-areia/20 bg-branco/50 p-3"
        >
          {editingIndex === i && draft ? (
            <div className="space-y-2">
              {fields.map((f) => (
                <div key={f.key} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <label className="sm:w-28 text-xs font-medium text-verde shrink-0">
                    {f.label}
                  </label>
                  <Input
                    value={draft[f.key] || ""}
                    onChange={(e) =>
                      setDraft({ ...draft, [f.key]: e.target.value } as T)
                    }
                    className="text-xs h-8"
                  />
                </div>
              ))}
              <div className="flex gap-1 justify-end">
                <Button size="sm" variant="ghost" onClick={cancelEdit}>
                  <X className="h-3 w-3" />
                </Button>
                <Button size="sm" onClick={saveEdit}>
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <div className="text-xs space-y-0.5">
                <span className="font-semibold text-preto">{entry.name || "(unnamed)"}</span>
                {fields
                  .filter((f) => f.key !== "name" && entry[f.key])
                  .map((f) => (
                    <div key={f.key} className="text-verde/70">
                      <span className="font-medium">{f.label}:</span> {entry[f.key]}
                    </div>
                  ))}
              </div>
              {!readOnly && (
                <div className="flex gap-1 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(i)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeEntry(i)}>
                    <Trash2 className="h-3 w-3 text-telha" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button size="sm" variant="outline" onClick={addEntry} className="gap-1">
          <Plus className="h-3 w-3" /> Add
        </Button>
      )}
    </div>
  );
}
