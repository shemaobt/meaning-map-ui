import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, Save, Undo2 } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { TFunction } from "i18next";
import { bookContextAPI } from "../../../services/api";
import { useBCDStore } from "../../../stores/bcdStore";
import { cn } from "../../../utils/cn";
import { formatBibleRef, isVerseRefShape } from "../../../utils/bibleRef";
import { humanizeEntityType, humanizeParticipantType } from "../../../utils/entityType";
import { Button } from "../../ui/button";

function formatPreviewValue(key: string, value: unknown, t: TFunction): string {
  if (value === null || value === undefined) return "—";
  if (isVerseRefShape(value)) return formatBibleRef(value);
  if (typeof value === "string") {
    if (key === "entity_type") return humanizeEntityType(value, t);
    if (key === "type") return humanizeParticipantType(value, t);
  }
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return "—";
}

interface SectionEditorProps {
  bcdId: string;
  sectionKey: string;
  label: string;
  icon: React.ElementType;
  readOnly: boolean;
  children: (props: {
    data: unknown;
    setData: (val: unknown) => void;
  }) => React.ReactNode;
}

export function SectionEditor({
  bcdId,
  sectionKey,
  label,
  icon: Icon,
  readOnly,
  children,
}: SectionEditorProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const currentBCD = useBCDStore((s) => s.currentBCD);
  const fetchBCD = useBCDStore((s) => s.fetchBCD);
  const dirtyValue = useBCDStore((s) => s.dirtySections[sectionKey]);
  const dirtyKeyPresent = useBCDStore((s) => sectionKey in s.dirtySections);
  const markDirty = useBCDStore((s) => s.markDirty);
  const clearDirty = useBCDStore((s) => s.clearDirty);
  const [saving, setSaving] = useState(false);

  if (!currentBCD) return null;

  const rawData = (currentBCD as unknown as Record<string, unknown>)[sectionKey];
  const localeData =
    locale !== "en"
      ? (currentBCD.translations?.[locale]?.[sectionKey] ?? null)
      : null;
  const baseData = localeData ?? rawData;
  const dirty = dirtyKeyPresent;
  const displayData = dirty ? dirtyValue : baseData;
  const hasContent = baseData !== null && baseData !== undefined;
  const itemCount = Array.isArray(baseData) ? baseData.length : null;

  const handleSetData = (val: unknown) => {
    markDirty(sectionKey, val);
  };

  const handleSave = async () => {
    setSaving(true);
    const snapshot = dirtyValue;
    try {
      await bookContextAPI.updateSection(bcdId, sectionKey, snapshot, locale);
      await fetchBCD(bcdId);
      // If the user typed during the network call, dirtySections[sectionKey]
      // now holds a newer reference; keep it dirty so they don't lose the
      // in-flight edits.
      const latest = useBCDStore.getState().dirtySections[sectionKey];
      if (latest === snapshot) {
        clearDirty(sectionKey);
      }
      if (locale !== "en") {
        toast.success(t("editors.sectionSavedTranslated", { label }));
      } else {
        toast.success(t("editors.sectionSaved", { label }));
      }
    } catch (e) {
      const msg = e instanceof AxiosError ? e.response?.data?.detail : t("editors.saveFailed");
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    clearDirty(sectionKey);
  };

  return (
    <div className="rounded-lg border border-areia/40 bg-surface shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <Icon className="h-4 w-4 text-verde/40 flex-shrink-0" />
        <span className="text-sm font-medium text-preto flex-1">{label}</span>
        {dirty && (
          <span className="text-[10px] font-medium text-telha bg-telha/10 rounded-full px-2 py-0.5">
            {t("editors.unsaved")}
          </span>
        )}
        {!hasContent && !dirty && (
          <span className="text-[10px] text-verde/30 italic">{t("bcdDetail.empty")}</span>
        )}
        {hasContent && itemCount !== null && (
          <span className="text-[10px] text-verde/40 bg-areia/15 rounded-full px-2 py-0.5 tabular-nums">{itemCount}</span>
        )}
      </div>

      <div className="px-4 pb-4 pt-1 border-t border-areia/15">
        <div className="mt-2">
          {children({ data: displayData, setData: handleSetData })}
        </div>
      </div>

      {!readOnly && dirty && (
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 bg-surface border-t border-areia/30 px-4 py-2 rounded-b-lg">
          <Button
            size="sm"
            variant="outline"
            onClick={handleDiscard}
            disabled={saving}
            className="gap-1.5 h-8"
          >
            <Undo2 className="h-3.5 w-3.5" />
            {t("editors.discard")}
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-1.5 h-8"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      )}
    </div>
  );
}

interface TextSectionProps {
  data: unknown;
  setData: (val: unknown) => void;
  readOnly: boolean;
  placeholder?: string;
}

export function TextSection({ data, setData, readOnly, placeholder }: TextSectionProps) {
  const { t } = useTranslation();
  const text = typeof data === "string" ? data : "";
  if (readOnly) {
    return (
      <div className={cn("text-sm text-preto leading-relaxed whitespace-pre-wrap", !text && "text-verde/40 italic")}>
        {text || t("editors.noContentYet")}
      </div>
    );
  }
  return (
    <textarea
      value={text}
      onChange={(e) => setData(e.target.value)}
      placeholder={placeholder}
      rows={6}
      className="w-full rounded-md border border-areia bg-surface px-3 py-2 text-sm focus:ring-2 focus:ring-telha focus:border-telha resize-y"
    />
  );
}

interface JSONSectionProps {
  data: unknown;
  setData: (val: unknown) => void;
  readOnly: boolean;
}

export function JSONSection({ data, setData, readOnly }: JSONSectionProps) {
  const { t } = useTranslation();
  const [parseError, setParseError] = useState<string | null>(null);
  const jsonStr = data != null ? JSON.stringify(data, null, 2) : "";

  if (readOnly) {
    if (!jsonStr) return <p className="text-sm text-verde/40 italic">{t("editors.noContentYet")}</p>;
    return <KeyValueView data={data} />;
  }

  return (
    <div>
      <textarea
        defaultValue={jsonStr}
        onChange={(e) => {
          try {
            const parsed = JSON.parse(e.target.value);
            setData(parsed);
            setParseError(null);
          } catch {
            setParseError(t("editors.invalidJSON"));
          }
        }}
        rows={12}
        className="w-full rounded-md border border-areia bg-surface px-3 py-2 text-xs font-mono focus:ring-2 focus:ring-telha focus:border-telha resize-y"
      />
      {parseError && <p className="text-xs text-red-600 mt-1">{parseError}</p>}
    </div>
  );
}

interface StructuredOutlineSectionProps {
  data: unknown;
  setData: (val: unknown) => void;
  readOnly: boolean;
}

export function StructuredOutlineSection({ data, setData, readOnly }: StructuredOutlineSectionProps) {
  const { t } = useTranslation();

  if (!readOnly) {
    return <JSONSection data={data} setData={setData} readOnly={false} />;
  }

  if (!data || typeof data !== "object") {
    return <p className="text-sm text-verde/40 italic">{t("editors.noContentYet")}</p>;
  }

  const outline = data as Record<string, unknown>;
  const bookArc = typeof outline.book_arc === "string" ? outline.book_arc : null;
  const chapters = Array.isArray(outline.chapters) ? outline.chapters : [];

  return (
    <div className="space-y-4">
      {bookArc && (
        <div className="rounded-md bg-surface-alt p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-verde/50 mb-1.5">{t("bcdDetail.bookArc")}</p>
          <p className="text-sm text-preto leading-relaxed">{bookArc}</p>
        </div>
      )}

      {chapters.length > 0 && (
        <div className="space-y-2">
          {chapters.map((ch: Record<string, unknown>, i: number) => (
            <div key={i} className="flex gap-3 rounded-md border border-areia/15 p-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-areia/15 flex items-center justify-center text-xs font-bold text-verde/50">
                {String(ch.chapter ?? i + 1)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-preto">
                  {String(ch.title ?? t("bcdDetail.chapterLabel", { number: ch.chapter ?? i + 1 }))}
                </p>
                {typeof ch.summary === "string" && (
                  <p className="text-xs text-verde/60 mt-1 leading-relaxed">{ch.summary}</p>
                )}
                {Array.isArray(ch.key_themes) && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {(ch.key_themes as string[]).map((th, j) => (
                      <span key={j} className="text-[10px] px-1.5 py-0.5 rounded-full bg-azul/10 text-azul">
                        {th}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {Object.entries(outline)
        .filter(([k]) => k !== "book_arc" && k !== "chapters")
        .map(([key, val]) => (
          <div key={key} className="rounded-md bg-surface-alt p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-verde/50 mb-1.5">
              {key.replace(/_/g, " ")}
            </p>
            {typeof val === "string" ? (
              <p className="text-sm text-preto leading-relaxed">{val}</p>
            ) : (
              <KeyValueView data={val} />
            )}
          </div>
        ))}
    </div>
  );
}

interface ListSectionProps {
  data: unknown;
  setData: (val: unknown) => void;
  readOnly: boolean;
  nameKey?: string;
}

export function ListSection({ data, setData, readOnly, nameKey = "name" }: ListSectionProps) {
  const { t } = useTranslation();
  const items = Array.isArray(data) ? data : [];
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  if (!readOnly) {
    return <JSONSection data={data} setData={setData} readOnly={false} />;
  }

  if (items.length === 0) {
    return <p className="text-sm text-verde/40 italic">{t("editors.noEntries")}</p>;
  }

  return (
    <div className="space-y-1">
      {items.map((item, i) => {
        const name = item[nameKey] || `Entry ${i + 1}`;
        const subtitle = item.role_in_book || item.question || item.description || item.type || null;
        const isOpen = expandedItem === i;

        return (
          <div key={i} className="rounded-md border border-areia/15 overflow-hidden">
            <button
              onClick={() => setExpandedItem(isOpen ? null : i)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-alt transition-colors"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-md bg-areia/10 flex items-center justify-center text-[10px] font-bold text-verde/40">
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-preto">{name}</span>
                {subtitle && (
                  <span className="text-xs text-verde/40 ml-2">{subtitle}</span>
                )}
              </div>
              {isOpen ? (
                <ChevronDown className="h-3 w-3 text-verde/30 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-3 w-3 text-verde/30 flex-shrink-0" />
              )}
            </button>
            {isOpen && (
              <div className="border-t border-areia/10 px-3 py-2.5">
                <ItemDetailView item={item} nameKey={nameKey} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ItemDetailView({ item, nameKey }: { item: Record<string, unknown>; nameKey: string }) {
  const { t } = useTranslation();
  const entries = Object.entries(item).filter(([k]) => k !== nameKey);

  if (entries.length === 0) {
    return <p className="text-xs text-verde/40 italic">{t("editors.noAdditionalDetails")}</p>;
  }

  return (
    <div className="space-y-2">
      {entries.map(([key, val]) => (
        <div key={key}>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-0.5">
            {key.replace(/_/g, " ")}
          </p>
          {typeof val === "string" ? (
            <p className="text-xs text-preto leading-relaxed">{formatPreviewValue(key, val, t)}</p>
          ) : Array.isArray(val) ? (
            <div className="flex flex-wrap gap-1">
              {val.map((v, i) => (
                <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-areia/15 text-verde">
                  {typeof v === "string" ? v : formatPreviewValue(key, v, t)}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-preto">{formatPreviewValue(key, val, t)}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function KeyValueView({ data }: { data: unknown }) {
  const { t } = useTranslation();
  if (typeof data === "string") {
    return <p className="text-sm text-preto leading-relaxed">{data}</p>;
  }
  if (isVerseRefShape(data)) {
    return <p className="text-sm font-mono text-preto">{formatBibleRef(data)}</p>;
  }
  if (Array.isArray(data)) {
    return (
      <div className="space-y-1">
        {data.map((item, i) => (
          <div key={i} className="rounded-md bg-surface-alt p-2.5">
            {typeof item === "string" ? (
              <p className="text-xs text-preto">{item}</p>
            ) : isVerseRefShape(item) ? (
              <p className="text-xs font-mono text-preto">{formatBibleRef(item)}</p>
            ) : typeof item === "object" && item !== null ? (
              <ItemDetailView item={item as Record<string, unknown>} nameKey="" />
            ) : (
              <p className="text-xs text-preto">{formatPreviewValue("", item, t)}</p>
            )}
          </div>
        ))}
      </div>
    );
  }
  if (typeof data === "object" && data !== null) {
    const entries = Object.entries(data as Record<string, unknown>);
    return (
      <div className="space-y-2.5">
        {entries.map(([key, val]) => (
          <div key={key}>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-0.5">
              {key.replace(/_/g, " ")}
            </p>
            {typeof val === "string" ? (
              <p className="text-sm text-preto leading-relaxed">{formatPreviewValue(key, val, t)}</p>
            ) : isVerseRefShape(val) ? (
              <p className="text-sm font-mono text-preto">{formatBibleRef(val)}</p>
            ) : Array.isArray(val) ? (
              <div className="flex flex-wrap gap-1">
                {val.map((v, i) => (
                  <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-areia/15 text-verde">
                    {typeof v === "string" ? v : formatPreviewValue(key, v, t)}
                  </span>
                ))}
              </div>
            ) : (
              <KeyValueView data={val} />
            )}
          </div>
        ))}
      </div>
    );
  }
  return <p className="text-sm text-preto">{String(data)}</p>;
}
