export type VerseRef = {
  chapter?: number | null;
  verse?: number | null;
  verseStart?: number | null;
  verseEnd?: number | null;
  chapterEnd?: number | null;
};

export function formatBibleRef(
  ref: VerseRef | null | undefined,
  opts?: { empty?: string },
): string {
  const empty = opts?.empty ?? "—";
  if (!ref || typeof ref !== "object") return empty;

  const chapter = numericOrNull(ref.chapter);
  const verse = numericOrNull(ref.verse);
  const verseStart = numericOrNull(ref.verseStart);
  const verseEnd = numericOrNull(ref.verseEnd);
  const chapterEnd = numericOrNull(ref.chapterEnd);

  if (chapter === null && verse === null && verseStart === null) return empty;

  if (chapter !== null && chapterEnd !== null && chapterEnd !== chapter) {
    const startVerse = verseStart ?? verse;
    if (startVerse !== null && verseEnd !== null) {
      return `${chapter}:${startVerse}—${chapterEnd}:${verseEnd}`;
    }
  }

  if (chapter !== null && verseStart !== null && verseEnd !== null) {
    return verseStart === verseEnd
      ? `${chapter}:${verseStart}`
      : `${chapter}:${verseStart}–${verseEnd}`;
  }

  if (chapter !== null && verse !== null) return `${chapter}:${verse}`;
  if (chapter !== null && verseStart !== null) return `${chapter}:${verseStart}`;
  if (chapter !== null) return `${chapter}`;

  return empty;
}

export function isVerseRefShape(value: unknown): value is VerseRef {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const obj = value as Record<string, unknown>;
  const hasRefKey =
    "chapter" in obj ||
    "verse" in obj ||
    "verseStart" in obj ||
    "verseEnd" in obj ||
    "chapterEnd" in obj;
  if (!hasRefKey) return false;
  for (const key of ["chapter", "verse", "verseStart", "verseEnd", "chapterEnd"]) {
    const v = obj[key];
    if (v !== undefined && v !== null && typeof v !== "number") return false;
  }
  return true;
}

function numericOrNull(v: unknown): number | null {
  return typeof v === "number" && Number.isFinite(v) ? v : null;
}
