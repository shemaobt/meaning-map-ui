import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, Plus, Trash2, User } from "lucide-react";
import {
  FieldGroup,
  ReadOnlyValue,
  VerseRefInput,
  EditableInput,
  EditableTextarea,
  TagsInput,
} from "./FieldPrimitives";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Button } from "../../../ui/button";

type VerseRef = { chapter?: number; verse?: number };
type ArcEntry = { at?: VerseRef; state?: string };
type Participant = {
  name?: string;
  english_gloss?: string;
  type?: string;
  entry_verse?: VerseRef;
  exit_verse?: VerseRef | null;
  role_in_book?: string;
  relationships?: string[];
  what_audience_knows_at_entry?: string;
  arc?: ArcEntry[];
  status_at_end?: string;
  [k: string]: unknown;
};

interface ParticipantEditorProps {
  data: unknown;
  setData: (val: unknown) => void;
}

export function ParticipantEditor({ data, setData }: ParticipantEditorProps) {
  const { t } = useTranslation();
  const items = Array.isArray(data) ? (data as Participant[]) : [];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const updateItem = (index: number, field: string, value: unknown) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setData(updated);
  };

  const updateArc = (itemIdx: number, arcIdx: number, field: string, value: unknown) => {
    const item = items[itemIdx];
    const arcs = [...(item.arc || [])];
    arcs[arcIdx] = { ...arcs[arcIdx], [field]: value };
    updateItem(itemIdx, "arc", arcs);
  };

  const addItem = () => {
    setData([...items, { name: "", type: "named", entry_verse: { chapter: 1, verse: 1 }, role_in_book: "", relationships: [], arc: [] }]);
    setOpenIdx(items.length);
  };

  const removeItem = (index: number) => {
    setData(items.filter((_, i) => i !== index));
    setOpenIdx(null);
  };

  const addArcEntry = (itemIdx: number) => {
    const item = items[itemIdx];
    const arcs = [...(item.arc || []), { at: { chapter: 1, verse: 1 }, state: "" }];
    updateItem(itemIdx, "arc", arcs);
  };

  const removeArcEntry = (itemIdx: number, arcIdx: number) => {
    const item = items[itemIdx];
    const arcs = (item.arc || []).filter((_, i) => i !== arcIdx);
    updateItem(itemIdx, "arc", arcs);
  };

  return (
    <div className="space-y-2">
      {items.map((p, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className="rounded-lg border border-areia/20 overflow-hidden bg-surface">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-surface-alt transition-colors"
            >
              <User className="h-4 w-4 text-azul/50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-preto">{p.name || `Participant ${i + 1}`}</span>
                {p.role_in_book && (
                  <span className="text-xs text-verde/40 ml-2">{p.role_in_book}</span>
                )}
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-areia/15 text-verde/50">
                {p.type ?? "named"}
              </span>
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-verde/30" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-verde/30" />
              )}
            </button>

            {isOpen && (
              <div className="border-t border-areia/15 px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label={t("fields.name")} readOnly>
                    <ReadOnlyValue value={p.name ?? ""} />
                  </FieldGroup>
                  <FieldGroup label={t("fields.englishGloss")}>
                    <EditableInput
                      value={p.english_gloss ?? ""}
                      onChange={(val) => updateItem(i, "english_gloss", val)}
                      placeholder={t("editors.placeholders.englishMeaning")}
                    />
                  </FieldGroup>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <FieldGroup label={t("fields.type")}>
                    <Select
                      value={p.type ?? "named"}
                      onValueChange={(val) => updateItem(i, "type", val)}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="named">{t("editors.named")}</SelectItem>
                        <SelectItem value="group">{t("editors.group")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldGroup>
                  <FieldGroup label={t("fields.entryVerse")}>
                    <VerseRefInput
                      verse={p.entry_verse}
                      onChange={(val) => updateItem(i, "entry_verse", val)}
                    />
                  </FieldGroup>
                  <FieldGroup label={t("fields.exitVerse")}>
                    <VerseRefInput
                      verse={p.exit_verse}
                      onChange={(val) => updateItem(i, "exit_verse", val)}
                    />
                  </FieldGroup>
                </div>

                <FieldGroup label={t("fields.roleInBook")}>
                  <EditableInput
                    value={p.role_in_book ?? ""}
                    onChange={(val) => updateItem(i, "role_in_book", val)}
                    placeholder={t("editors.placeholders.roleExample")}
                  />
                </FieldGroup>

                <FieldGroup label={t("fields.relationships")}>
                  <TagsInput
                    tags={Array.isArray(p.relationships) ? p.relationships : []}
                    onChange={(tags) => updateItem(i, "relationships", tags)}
                    placeholder={t("editors.placeholders.addRelationship")}
                  />
                </FieldGroup>

                <FieldGroup label={t("fields.whatAudienceKnows")}>
                  <EditableTextarea
                    value={p.what_audience_knows_at_entry ?? ""}
                    onChange={(val) => updateItem(i, "what_audience_knows_at_entry", val)}
                    placeholder={t("editors.placeholders.audienceKnowledge")}
                    rows={2}
                  />
                </FieldGroup>

                {Array.isArray(p.arc) && p.arc.length > 0 && (
                  <FieldGroup label={t("fields.characterArc")}>
                    <div className="space-y-1.5">
                      {p.arc.map((a, ai) => (
                        <div key={ai} className="flex items-center gap-2">
                          <VerseRefInput
                            verse={a.at}
                            onChange={(val) => updateArc(i, ai, "at", val)}
                          />
                          <EditableInput
                            value={a.state ?? ""}
                            onChange={(val) => updateArc(i, ai, "state", val)}
                            placeholder={t("editors.placeholders.stateAtPoint")}
                            className="flex-1"
                          />
                          <button type="button" onClick={() => removeArcEntry(i, ai)} className="text-verde/30 hover:text-red-500 transition-colors">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </FieldGroup>
                )}
                <Button type="button" size="sm" variant="outline" onClick={() => addArcEntry(i)} className="gap-1 h-7 text-xs">
                  <Plus className="h-3 w-3" /> {t("editors.addArcEntry")}
                </Button>

                <FieldGroup label={t("fields.statusAtEnd")}>
                  <EditableInput
                    value={p.status_at_end ?? ""}
                    onChange={(val) => updateItem(i, "status_at_end", val)}
                    placeholder={t("editors.placeholders.statusExample")}
                  />
                </FieldGroup>

                <div className="flex justify-end pt-2 border-t border-areia/10">
                  <Button type="button" size="sm" variant="outline" onClick={() => removeItem(i)} className="gap-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="h-3 w-3" /> {t("editors.removeParticipant")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button type="button" variant="outline" onClick={addItem} className="w-full gap-1.5 h-10 border-dashed border-areia/40 text-verde/50 hover:text-telha hover:border-telha/30">
        <Plus className="h-4 w-4" /> {t("editors.addParticipant")}
      </Button>
    </div>
  );
}
