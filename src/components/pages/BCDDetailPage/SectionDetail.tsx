import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { TFunction } from "i18next";
import type { BCD } from "../../../types/bookContext";
import { formatBibleRef, isVerseRefShape } from "../../../utils/bibleRef";
import { humanizeEntityType, humanizeParticipantType } from "../../../utils/entityType";

function formatScalar(label: string, value: unknown, t: TFunction): string {
  if (typeof value === "string") {
    if (label === "entity_type") return humanizeEntityType(value, t);
    if (label === "type") return humanizeParticipantType(value, t);
  }
  if (isVerseRefShape(value)) return formatBibleRef(value);
  return String(value);
}

function renderMiniValue(key: string, value: unknown, t: TFunction): string {
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

interface SectionDetailProps {
  bcd: BCD;
  sectionKey: string;
}

export function SectionDetail({ bcd, sectionKey }: SectionDetailProps) {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const rawData = (bcd as unknown as Record<string, unknown>)[sectionKey];
  const localeData =
    locale !== "en"
      ? (bcd.translations?.[locale]?.[sectionKey] ?? null)
      : null;
  const displayData = localeData ?? rawData;

  return (
    <div className="rounded-xl border border-areia/20 bg-surface p-4 sm:p-5">
      <StructuredView data={displayData} sectionKey={sectionKey} />
    </div>
  );
}

function StructuredView({ data, sectionKey }: { data: unknown; sectionKey: string }) {
  const { t } = useTranslation();

  if (data === null || data === undefined) {
    return <p className="text-sm text-verde/40 italic">{t("bcdDetail.sectionEmpty")}</p>;
  }

  if (sectionKey === "structural_outline") return <OutlineView data={data} />;
  if (sectionKey === "theological_spine") return <TextView data={data} />;

  if (Array.isArray(data)) return <ListView items={data} sectionKey={sectionKey} />;
  if (typeof data === "string") return <TextView data={data} />;
  if (typeof data === "object") return <ObjectView data={data as Record<string, unknown>} />;

  return <p className="text-sm text-preto">{String(data)}</p>;
}

function OutlineView({ data }: { data: unknown }) {
  const { t } = useTranslation();

  if (typeof data !== "object" || data === null) return <TextView data={data} />;

  const outline = data as Record<string, unknown>;
  const bookArc = typeof outline.book_arc === "string" ? outline.book_arc : null;
  const chapters = Array.isArray(outline.chapters) ? outline.chapters : [];
  const otherKeys = Object.keys(outline).filter((k) => k !== "book_arc" && k !== "chapters");

  return (
    <div className="space-y-4">
      {bookArc && (
        <div className="rounded-lg bg-surface-alt p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-2">{t("bcdDetail.bookArc")}</p>
          <p className="text-sm text-preto leading-relaxed">{bookArc}</p>
        </div>
      )}
      {chapters.length > 0 && (
        <div className="space-y-2">
          {chapters.map((ch: Record<string, unknown>, i: number) => (
            <ChapterCard key={i} chapter={ch} index={i} />
          ))}
        </div>
      )}
      {otherKeys.map((key) => (
        <FieldBlock key={key} label={key} value={outline[key]} />
      ))}
    </div>
  );
}

function ChapterCard({ chapter, index }: { chapter: Record<string, unknown>; index: number }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const num = String(chapter.chapter ?? index + 1);
  const title = String(chapter.title ?? t("bcdDetail.chapterLabel", { number: num }));
  const summary = typeof chapter.summary === "string" ? chapter.summary : null;
  const keyEvents = Array.isArray(chapter.key_events) ? chapter.key_events : [];
  const keyThemes = Array.isArray(chapter.key_themes) ? chapter.key_themes : [];
  const otherKeys = Object.keys(chapter).filter((k) => !["chapter", "title", "summary", "key_events", "key_themes"].includes(k));

  return (
    <div className="rounded-lg border border-areia/15 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-alt transition-colors">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-telha/10 flex items-center justify-center text-xs font-bold text-telha">{num}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-preto">{title}</p>
          {summary && !open && <p className="text-xs text-verde/50 truncate mt-0.5">{summary}</p>}
        </div>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-verde/30" /> : <ChevronRight className="h-3.5 w-3.5 text-verde/30" />}
      </button>
      {open && (
        <div className="border-t border-areia/10 px-4 py-3 space-y-3">
          {summary && <p className="text-sm text-preto leading-relaxed">{summary}</p>}
          {keyEvents.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-1.5">{t("bcdDetail.keyEvents")}</p>
              <ul className="space-y-1">
                {keyEvents.map((ev, i) => (
                  <li key={i} className="flex gap-2 text-xs text-preto/80">
                    <span className="text-verde/30 flex-shrink-0">•</span>
                    <span>{String(ev)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {keyThemes.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-1.5">{t("bcdDetail.keyThemes")}</p>
              <div className="flex flex-wrap gap-1">
                {keyThemes.map((th, j) => (
                  <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-azul/10 text-azul">{String(th)}</span>
                ))}
              </div>
            </div>
          )}
          {otherKeys.map((k) => (
            <FieldBlock key={k} label={k} value={chapter[k]} />
          ))}
        </div>
      )}
    </div>
  );
}

function ListView({ items, sectionKey }: { items: unknown[]; sectionKey: string }) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const nameKey = getNameKey(sectionKey);

  return (
    <div className="space-y-1.5">
      {items.map((item, i) => {
        if (typeof item !== "object" || item === null) {
          return <p key={i} className="text-sm text-preto">{String(item)}</p>;
        }
        const obj = item as Record<string, unknown>;
        const name = String(obj[nameKey] ?? obj.name ?? obj.label ?? `Entry ${i + 1}`);
        const englishGloss = typeof obj.english_gloss === "string" && obj.english_gloss ? obj.english_gloss : null;
        const displayName = typeof obj.display_name === "string" && obj.display_name ? obj.display_name : null;
        const labelLine2 = displayName ?? englishGloss;
        const subtitle = getSubtitle(obj, nameKey);
        const isOpen = expandedIdx === i;
        const detailKeys = Object.keys(obj).filter(
          (k) => k !== nameKey && k !== "english_gloss" && k !== "display_name",
        );

        return (
          <div key={i} className="rounded-lg border border-areia/15 overflow-hidden">
            <button
              onClick={() => setExpandedIdx(isOpen ? null : i)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-alt transition-colors"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-md bg-areia/10 flex items-center justify-center text-[10px] font-bold text-verde/40">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <span className="text-[15px] font-serif text-preto" dir="rtl" lang="he">{name}</span>
                {labelLine2 && <span className="text-sm text-verde/70 ml-2">{labelLine2}</span>}
                {subtitle && !isOpen && <span className="text-xs text-verde/40 ml-2 truncate">{subtitle}</span>}
              </div>
              {isOpen ? <ChevronDown className="h-3 w-3 text-verde/30" /> : <ChevronRight className="h-3 w-3 text-verde/30" />}
            </button>
            {isOpen && detailKeys.length > 0 && (
              <div className="border-t border-areia/10 px-3 py-3 space-y-2.5">
                {detailKeys.map((key) => (
                  <FieldBlock key={key} label={key} value={obj[key]} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ObjectView({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, val]) => (
        <FieldBlock key={key} label={key} value={val} />
      ))}
    </div>
  );
}

function TextView({ data }: { data: unknown }) {
  const { t } = useTranslation();
  const text = typeof data === "string" ? data : String(data ?? "");
  if (!text) return <p className="text-sm text-verde/40 italic">{t("bcdDetail.sectionEmpty")}</p>;
  return <p className="text-sm text-preto leading-relaxed whitespace-pre-wrap">{text}</p>;
}

function FieldBlock({ label, value }: { label: string; value: unknown }) {
  const { t } = useTranslation();
  const displayLabel = label.replace(/_/g, " ");

  if (value === null || value === undefined) return null;

  if (typeof value === "string") {
    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-0.5">{displayLabel}</p>
        <p className="text-xs text-preto leading-relaxed">{formatScalar(label, value, t)}</p>
      </div>
    );
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-0.5">{displayLabel}</p>
        <p className="text-xs text-preto">{String(value)}</p>
      </div>
    );
  }

  if (isVerseRefShape(value)) {
    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-0.5">{displayLabel}</p>
        <p className="text-xs font-mono text-preto">{formatBibleRef(value)}</p>
      </div>
    );
  }

  if (Array.isArray(value)) {
    const allStrings = value.every((v) => typeof v === "string");
    const allRefs = value.length > 0 && value.every(isVerseRefShape);
    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-1">{displayLabel}</p>
        {allStrings ? (
          <div className="flex flex-wrap gap-1">
            {value.map((v, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-areia/15 text-verde">{v}</span>
            ))}
          </div>
        ) : allRefs ? (
          <div className="flex flex-wrap gap-1">
            {value.map((v, i) => (
              <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-areia/15 text-verde/70">{formatBibleRef(v)}</span>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {value.map((v, i) => {
              if (typeof v === "string") {
                return <div key={i} className="rounded-md bg-surface-alt px-2.5 py-1.5 text-xs text-preto">{v}</div>;
              }
              if (typeof v === "object" && v !== null) {
                const obj = v as Record<string, unknown>;
                return (
                  <div key={i} className="rounded-md bg-surface-alt px-2.5 py-1.5 text-xs text-preto">
                    <MiniObject data={obj} />
                  </div>
                );
              }
              return <div key={i} className="rounded-md bg-surface-alt px-2.5 py-1.5 text-xs text-preto">{String(v)}</div>;
            })}
          </div>
        )}
      </div>
    );
  }

  if (typeof value === "object") {
    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-1">{displayLabel}</p>
        <div className="rounded-md bg-surface-alt px-3 py-2">
          <MiniObject data={value as Record<string, unknown>} />
        </div>
      </div>
    );
  }

  return null;
}

function MiniObject({ data }: { data: Record<string, unknown> }) {
  const { t } = useTranslation();
  const name = typeof data.name === "string" ? data.name : null;
  const gloss = typeof data.english_gloss === "string" && data.english_gloss ? data.english_gloss : null;
  const skipKeys = new Set(name && gloss ? ["name", "english_gloss"] : []);

  return (
    <div className="space-y-1">
      {name && (
        <div className="flex items-baseline gap-2 text-xs">
          <span className="text-[13px] font-serif text-preto" dir="rtl" lang="he">{name}</span>
          {gloss && <span className="text-verde/70">{gloss}</span>}
        </div>
      )}
      {Object.entries(data)
        .filter(([k]) => !skipKeys.has(k) && (name ? k !== "name" : true))
        .map(([k, v]) => (
          <div key={k} className="flex gap-2 text-xs">
            <span className="text-verde/40 flex-shrink-0">{k.replace(/_/g, " ")}:</span>
            <span className="text-preto">{renderMiniValue(k, v, t)}</span>
          </div>
        ))}
    </div>
  );
}

function getNameKey(sectionKey: string): string {
  if (sectionKey === "discourse_threads") return "label";
  return "name";
}

function getSubtitle(obj: Record<string, unknown>, nameKey: string): string | null {
  for (const k of ["what_it_is", "role_in_book", "question", "description", "type", "primary_genre"]) {
    if (k !== nameKey && typeof obj[k] === "string") return obj[k] as string;
  }
  return null;
}
