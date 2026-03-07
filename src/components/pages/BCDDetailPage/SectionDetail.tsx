import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { BCD } from "../../../types/bookContext";

interface SectionDetailProps {
  bcd: BCD;
  sectionKey: string;
}

export function SectionDetail({ bcd, sectionKey }: SectionDetailProps) {
  const rawData = (bcd as unknown as Record<string, unknown>)[sectionKey];

  return (
    <div className="rounded-xl border border-areia/20 bg-surface p-4 sm:p-5">
      <StructuredView data={rawData} sectionKey={sectionKey} />
    </div>
  );
}

function StructuredView({ data, sectionKey }: { data: unknown; sectionKey: string }) {
  if (data === null || data === undefined) {
    return <p className="text-sm text-verde/40 italic">No content yet. Generate or edit to populate.</p>;
  }

  if (sectionKey === "structural_outline") return <OutlineView data={data} />;
  if (sectionKey === "theological_spine") return <TextView data={data} />;

  if (Array.isArray(data)) return <ListView items={data} sectionKey={sectionKey} />;
  if (typeof data === "string") return <TextView data={data} />;
  if (typeof data === "object") return <ObjectView data={data as Record<string, unknown>} />;

  return <p className="text-sm text-preto">{String(data)}</p>;
}

// ─── Structural Outline ────────────────────────────────────────────────────

function OutlineView({ data }: { data: unknown }) {
  if (typeof data !== "object" || data === null) return <TextView data={data} />;

  const outline = data as Record<string, unknown>;
  const bookArc = typeof outline.book_arc === "string" ? outline.book_arc : null;
  const chapters = Array.isArray(outline.chapters) ? outline.chapters : [];
  const otherKeys = Object.keys(outline).filter((k) => k !== "book_arc" && k !== "chapters");

  return (
    <div className="space-y-4">
      {bookArc && (
        <div className="rounded-lg bg-surface-alt p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-2">Book Arc</p>
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
  const [open, setOpen] = useState(false);
  const num = String(chapter.chapter ?? index + 1);
  const title = String(chapter.title ?? `Chapter ${num}`);
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
              <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-1.5">Key Events</p>
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
              <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-1.5">Key Themes</p>
              <div className="flex flex-wrap gap-1">
                {keyThemes.map((t, j) => (
                  <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-azul/10 text-azul">{String(t)}</span>
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

// ─── List view (participants, places, threads, etc.) ───────────────────────

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
        const subtitle = getSubtitle(obj, nameKey);
        const isOpen = expandedIdx === i;
        const detailKeys = Object.keys(obj).filter((k) => k !== nameKey);

        return (
          <div key={i} className="rounded-lg border border-areia/15 overflow-hidden">
            <button
              onClick={() => setExpandedIdx(isOpen ? null : i)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-surface-alt transition-colors"
            >
              <span className="flex-shrink-0 w-6 h-6 rounded-md bg-areia/10 flex items-center justify-center text-[10px] font-bold text-verde/40">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-preto">{name}</span>
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

// ─── Object key-value view ─────────────────────────────────────────────────

function ObjectView({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-3">
      {Object.entries(data).map(([key, val]) => (
        <FieldBlock key={key} label={key} value={val} />
      ))}
    </div>
  );
}

// ─── Text view ─────────────────────────────────────────────────────────────

function TextView({ data }: { data: unknown }) {
  const text = typeof data === "string" ? data : String(data ?? "");
  if (!text) return <p className="text-sm text-verde/40 italic">No content yet.</p>;
  return <p className="text-sm text-preto leading-relaxed whitespace-pre-wrap">{text}</p>;
}

// ─── Reusable field block ──────────────────────────────────────────────────

function FieldBlock({ label, value }: { label: string; value: unknown }) {
  const displayLabel = label.replace(/_/g, " ");

  if (value === null || value === undefined) return null;

  if (typeof value === "string") {
    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-0.5">{displayLabel}</p>
        <p className="text-xs text-preto leading-relaxed">{value}</p>
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

  if (Array.isArray(value)) {
    const allStrings = value.every((v) => typeof v === "string");
    return (
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40 mb-1">{displayLabel}</p>
        {allStrings ? (
          <div className="flex flex-wrap gap-1">
            {value.map((v, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-areia/15 text-verde">{v}</span>
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {value.map((v, i) => (
              <div key={i} className="rounded-md bg-surface-alt px-2.5 py-1.5 text-xs text-preto">
                {typeof v === "string" ? v : typeof v === "object" && v !== null ? <MiniObject data={v as Record<string, unknown>} /> : String(v)}
              </div>
            ))}
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
  return (
    <div className="space-y-1">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="flex gap-2 text-xs">
          <span className="text-verde/40 flex-shrink-0">{k.replace(/_/g, " ")}:</span>
          <span className="text-preto">{typeof v === "string" || typeof v === "number" ? String(v) : JSON.stringify(v)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getNameKey(sectionKey: string): string {
  if (sectionKey === "discourse_threads") return "label";
  return "name";
}

function getSubtitle(obj: Record<string, unknown>, nameKey: string): string | null {
  for (const k of ["role_in_book", "question", "description", "type", "primary_genre"]) {
    if (k !== nameKey && typeof obj[k] === "string") return obj[k] as string;
  }
  return null;
}
