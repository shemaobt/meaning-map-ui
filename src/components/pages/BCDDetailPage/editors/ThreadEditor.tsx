import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, MessageCircle, Plus, Trash2 } from "lucide-react";
import {
  FieldGroup,
  VerseRefBadge,
  EditableInput,
  EditableTextarea,
} from "./FieldPrimitives";
import { Button } from "../../../ui/button";

type VerseRef = { chapter?: number; verse?: number };
type EpisodeStatus = { at?: VerseRef; status?: string };
type Thread = {
  label?: string;
  opened_at?: VerseRef;
  resolved_at?: VerseRef | null;
  question?: string;
  status_by_episode?: EpisodeStatus[];
  [k: string]: unknown;
};

interface ThreadEditorProps {
  data: unknown;
  setData: (val: unknown) => void;
}

export function ThreadEditor({ data, setData }: ThreadEditorProps) {
  const { t } = useTranslation();
  const items = Array.isArray(data) ? (data as Thread[]) : [];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const updateItem = (index: number, field: string, value: unknown) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setData(updated);
  };

  const updateEpisode = (itemIdx: number, epIdx: number, status: string) => {
    const item = items[itemIdx];
    const episodes = [...(item.status_by_episode || [])];
    episodes[epIdx] = { ...episodes[epIdx], status };
    updateItem(itemIdx, "status_by_episode", episodes);
  };

  const addItem = () => {
    setData([...items, { label: "", opened_at: { chapter: 1, verse: 1 }, question: "", status_by_episode: [] }]);
    setOpenIdx(items.length);
  };

  const removeItem = (index: number) => {
    setData(items.filter((_, i) => i !== index));
    setOpenIdx(null);
  };

  const addEpisode = (itemIdx: number) => {
    const item = items[itemIdx];
    const episodes = [...(item.status_by_episode || []), { at: { chapter: 1, verse: 1 }, status: "" }];
    updateItem(itemIdx, "status_by_episode", episodes);
  };

  const removeEpisode = (itemIdx: number, epIdx: number) => {
    const item = items[itemIdx];
    const episodes = (item.status_by_episode || []).filter((_, i) => i !== epIdx);
    updateItem(itemIdx, "status_by_episode", episodes);
  };

  return (
    <div className="space-y-2">
      {items.map((th, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className="rounded-lg border border-areia/20 overflow-hidden bg-surface">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-surface-alt transition-colors"
            >
              <MessageCircle className="h-4 w-4 text-verde-claro/50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-preto">{th.label || `Thread ${i + 1}`}</span>
                {th.question && (
                  <span className="text-xs text-verde/40 ml-2 truncate">{th.question}</span>
                )}
              </div>
              {th.resolved_at && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-verde-claro/15 text-verde-claro">
                  {t("editors.resolved")}
                </span>
              )}
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-verde/30" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-verde/30" />
              )}
            </button>

            {isOpen && (
              <div className="border-t border-areia/15 px-4 py-4 space-y-4">
                <FieldGroup label={t("fields.label")}>
                  <EditableInput
                    value={th.label ?? ""}
                    onChange={(val) => updateItem(i, "label", val)}
                    placeholder={t("editors.placeholders.threadLabel")}
                  />
                </FieldGroup>

                <FieldGroup label={t("fields.drivingQuestion")}>
                  <EditableTextarea
                    value={th.question ?? ""}
                    onChange={(val) => updateItem(i, "question", val)}
                    placeholder={t("editors.placeholders.threadQuestion")}
                    rows={2}
                  />
                </FieldGroup>

                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label={t("fields.openedAt")} readOnly>
                    <div className="flex items-center h-9">
                      <VerseRefBadge verse={th.opened_at} />
                    </div>
                  </FieldGroup>
                  <FieldGroup label={t("fields.resolvedAt")} readOnly>
                    <div className="flex items-center h-9">
                      <VerseRefBadge verse={th.resolved_at} />
                    </div>
                  </FieldGroup>
                </div>

                <FieldGroup label={t("fields.statusByEpisode")}>
                  <div className="space-y-1.5">
                    {(th.status_by_episode || []).map((ep, ei) => (
                      <div key={ei} className="flex items-center gap-2">
                        <VerseRefBadge verse={ep.at} />
                        <EditableInput
                          value={ep.status ?? ""}
                          onChange={(val) => updateEpisode(i, ei, val)}
                          placeholder={t("editors.placeholders.threadStatus")}
                          className="flex-1"
                        />
                        <button type="button" onClick={() => removeEpisode(i, ei)} className="text-verde/30 hover:text-red-500 transition-colors">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => addEpisode(i)} className="gap-1 h-7 text-xs mt-2">
                    <Plus className="h-3 w-3" /> {t("editors.addEpisode")}
                  </Button>
                </FieldGroup>

                <div className="flex justify-end pt-2 border-t border-areia/10">
                  <Button type="button" size="sm" variant="outline" onClick={() => removeItem(i)} className="gap-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="h-3 w-3" /> {t("editors.removeThread")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <Button type="button" variant="outline" onClick={addItem} className="w-full gap-1.5 h-10 border-dashed border-areia/40 text-verde/50 hover:text-telha hover:border-telha/30">
        <Plus className="h-4 w-4" /> {t("editors.addThread")}
      </Button>
    </div>
  );
}
