import { useState } from "react";
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
  const outline = (typeof data === "object" && data !== null ? data : {}) as Record<string, unknown>;
  const bookArc = typeof outline.book_arc === "string" ? outline.book_arc : "";
  const chapters = Array.isArray(outline.chapters) ? (outline.chapters as Chapter[]) : [];

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
      <FieldGroup label="Book Arc">
        <EditableTextarea
          value={bookArc}
          onChange={(val) => update("book_arc", val)}
          placeholder="Describe the overall narrative arc of the book..."
          rows={4}
        />
      </FieldGroup>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-verde/50">
            Chapters ({chapters.length})
          </p>
          <Button type="button" size="sm" variant="outline" onClick={addChapter} className="gap-1 h-7 text-xs">
            <Plus className="h-3 w-3" /> Add Chapter
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
    </div>
  );
}

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
  const [open, setOpen] = useState(false);
  const num = chapter.chapter ?? index + 1;

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
          {chapter.title || `Chapter ${num}`}
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-verde/30 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-verde/30 flex-shrink-0" />
        )}
      </button>

      {open && (
        <div className="border-t border-areia/15 px-4 py-4 space-y-4">
          <FieldGroup label="Title">
            <EditableInput
              value={chapter.title ?? ""}
              onChange={(val) => onUpdate("title", val)}
              placeholder="Chapter title"
            />
          </FieldGroup>

          <FieldGroup label="Summary">
            <EditableTextarea
              value={chapter.summary ?? ""}
              onChange={(val) => onUpdate("summary", val)}
              placeholder="Brief summary of this chapter..."
              rows={3}
            />
          </FieldGroup>

          <FieldGroup label="Key Events">
            <TagsInput
              tags={Array.isArray(chapter.key_events) ? chapter.key_events : []}
              onChange={(tags) => onUpdate("key_events", tags)}
              placeholder="Add key event and press Enter"
            />
          </FieldGroup>

          <FieldGroup label="Key Themes">
            <TagsInput
              tags={Array.isArray(chapter.key_themes) ? chapter.key_themes : []}
              onChange={(tags) => onUpdate("key_themes", tags)}
              placeholder="Add theme and press Enter"
            />
          </FieldGroup>

          <div className="flex justify-end pt-2 border-t border-areia/10">
            <Button type="button" size="sm" variant="outline" onClick={onRemove} className="gap-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
              <Trash2 className="h-3 w-3" /> Remove Chapter
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
