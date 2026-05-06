import { useTranslation } from "react-i18next";
import { Sparkles, UserPlus } from "lucide-react";

export const PROVENANCE_KEY = "_source";

export type EntrySource = "ai" | "ai_edited" | "human";

type AnyEntry = Record<string, unknown> | null | undefined;

export function getEntrySource(entry: AnyEntry): EntrySource {
  const value = entry?.[PROVENANCE_KEY];
  if (value === "human" || value === "ai_edited") return value;
  return "ai";
}

export function markAsHuman<T extends Record<string, unknown>>(entry: T): T {
  return { ...entry, [PROVENANCE_KEY]: "human" };
}

export function markAsEdited<T extends Record<string, unknown>>(entry: T): T {
  const current = entry[PROVENANCE_KEY];
  if (current === "human" || current === "ai_edited") return entry;
  return { ...entry, [PROVENANCE_KEY]: "ai_edited" };
}

export function EntrySourceBadge({ source }: { source: EntrySource }) {
  const { t } = useTranslation();
  if (source === "ai") return null;

  if (source === "human") {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-verde-claro/15 text-verde-claro border border-verde-claro/30"
        title={t("provenance.humanTooltip")}
      >
        <UserPlus className="h-2.5 w-2.5" />
        {t("provenance.added")}
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-areia/30 text-verde/70 border border-areia/40"
      title={t("provenance.editedTooltip")}
    >
      <Sparkles className="h-2.5 w-2.5" />
      {t("provenance.edited")}
    </span>
  );
}
