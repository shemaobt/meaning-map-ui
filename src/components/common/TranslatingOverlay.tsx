import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { SUPPORTED_LANGUAGES } from "../../i18n";

interface TranslatingOverlayProps {
  isTranslating: boolean;
}

export function TranslatingOverlay({ isTranslating }: TranslatingOverlayProps) {
  const { t, i18n } = useTranslation();

  if (!isTranslating) return null;

  const langLabel = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language)?.label ?? i18n.language;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-areia/30 bg-surface p-8 shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-telha" />
        <p className="text-lg font-medium text-preto dark:text-white">
          {t("i18n.translating", { language: langLabel })}
        </p>
        <p className="text-sm text-verde/70 dark:text-white/60">
          {t("i18n.translatingSubtext")}
        </p>
      </div>
    </div>
  );
}
