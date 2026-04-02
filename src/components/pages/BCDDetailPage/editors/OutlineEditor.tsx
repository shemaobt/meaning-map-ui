import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, GripVertical, Plus, Trash2 } from "lucide-react";
import { FieldGroup, EditableInput, EditableTextarea, TagsInput } from "./FieldPrimitives";
import { Button } from "../../../ui/button";

interface OutlineEditorProps {
  data: unknown;
  setData: (val: unknown) => void;
}

type Chapter = {
  chapter?: number;
  title?: string;
  summary?: string;
  key_events?: string[];
  key_themes?: string[];
  [k: string]: unknown;
};

export function OutlineEditor({ data, setData }: OutlineEditorProps) {
  const { t } = useTranslation();
  const outline = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;
  const bookArc = typeof outline.book_arc === "string" ? outline.book_arc : "";
  const chapters = Array.isArray(outline.chapters) ? (outline.chapters as Chapter[]) : [];
  const otherKeys = Object.keys(outline).filter((k) => k !== "book_arc" && k !== "chapters");

  const update = (field: string, value: unknown) => {
    setData({ ...outline, [field]: value });
  };

  const updateChapter = (index: number, field: string, value: unknown) => {
    const updated = chapters.map((ch, i) => (i === index ? { ...ch, [field]: value } : ch));
    update("chapters", updated);
  };

  const addChapter = () => {
    const nextNum = chapters.length + 1;
    update("chapters", [...chapters, { chapter: nextNum, title: "", summary: "", key_events: [], key_themes: [] }]);
  };

  const removeChapter = (index: number) => {
    update("chapters", chapters.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      <FieldGroup label={t("bcdDetail.bookArc")}>
        <EditableTextarea
          value={bookArc}
          onChange={(val) => update("book_arc", val)}
          placeholder={t("editors.placeholders.bookArc")}
          rows={4}
        />
      </FieldGroup>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-verde/50">
            {t("fields.chapters")} ({chapters.length})
          </p>
          <Button type="button" size="sm" variant="outline" onClick={addChapter} className="gap-1 h-7 text-xs">
            <Plus className="h-3 w-3" /> {t("editors.addChapter")}
          </Button>
        </div>
        <div className="space-y-2">
          {chapters.map((ch, i) => (
            <ChapterCard
              key={i}
              chapter={ch}
              index={i}
              onUpdate={(field, value) => updateChapter(i, field, value)}
              onRemove={() => removeChapter(i)}
            />
          ))}
        </div>
      </div>

      {otherKeys.map((key) => {
        const val = outline[key];
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

const KNOWN_CHAPTER_KEYS = new Set(["chapter", "title", "summary", "key_events", "key_themes"]);

function ChapterCard({
  chapter,
  index,
  onUpdate,
  onRemove,
}: {
  chapter: Chapter;
  index: number;
  onUpdate: (field: string, value: unknown) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const num = chapter.chapter ?? index + 1;
  const otherKeys = Object.keys(chapter).filter((k) => !KNOWN_CHAPTER_KEYS.has(k));

  return (
    <div className="rounded-lg border border-areia/20 overflow-hidden bg-surface">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-alt transition-colors"
      >
        <GripVertical className="h-3.5 w-3.5 text-verde/20 flex-shrink-0" />
        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-telha/10 flex items-center justify-center text-xs font-bold text-telha">
          {num}
        </span>
        <span className="flex-1 text-sm font-medium text-preto truncate">
          {chapter.title || t("bcdDetail.chapterLabel", { number: num })}
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-verde/30 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-verde/30 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-areia/15 px-4 py-4 space-y-4">
          <FieldGroup label={t("fields.title")}>
            <EditableInput
              value={chapter.title ?? ""}
              onChange={(val) => onUpdate("title", val)}
              placeholder={t("editors.placeholders.chapterTitle")}
            />
          </FieldGroup>

          <FieldGroup label={t("fields.summary")}>
            <EditableTextarea
              value={chapter.summary ?? ""}
              onChange={(val) => onUpdate("summary", val)}
              placeholder={t("editors.placeholders.chapterSummary")}
              rows={3}
            />
          </FieldGroup>

          <FieldGroup label={t("bcdDetail.keyEvents")}>
            <TagsInput
              tags={Array.isArray(chapter.key_events) ? chapter.key_events : []}
              onChange={(tags) => onUpdate("key_events", tags)}
              placeholder={t("editors.placeholders.addKeyEvent")}
            />
          </FieldGroup>

          <FieldGroup label={t("bcdDetail.keyThemes")}>
            <TagsInput
              tags={Array.isArray(chapter.key_themes) ? chapter.key_themes : []}
              onChange={(tags) => onUpdate("key_themes", tags)}
              placeholder={t("editors.placeholders.addTheme")}
            />
          </FieldGroup>

          {otherKeys.map((key) => {
            const val = chapter[key];
            return (
              <FieldGroup key={key} label={key.replace(/_/g, " ")}>
                {typeof val === "string" ? (
                  <EditableTextarea
                    value={val}
                    onChange={(v) => onUpdate(key, v)}
                    rows={2}
                  />
                ) : Array.isArray(val) ? (
                  <TagsInput
                    tags={val.map(String)}
                    onChange={(tags) => onUpdate(key, tags)}
                  />
                ) : (
                  <EditableInput
                    value={String(val ?? "")}
                    onChange={(v) => onUpdate(key, v)}
                  />
                )}
              </FieldGroup>
            );
          })}

          <div className="flex justify-end pt-2 border-t border-areia/10">
            <Button type="button" size="sm" variant="outline" onClick={onRemove} className="gap-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              <Trash2 className="h-3 w-3" /> {t("editors.removeChapter")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
