import { useCallback } from "react";
import { useTranslation } from "react-i18next";

/**
 * Returns helpers to translate Bible book names and abbreviations.
 * Falls back to the original English value if no translation exists.
 */
export function useBookName() {
  const { t } = useTranslation();

  return useCallback(
    (englishName: string): string => {
      const key = `bibleBooks.${englishName}`;
      const translated = t(key);
      return translated === key ? englishName : translated;
    },
    [t],
  );
}

export function useBookAbbr() {
  const { t } = useTranslation();

  return useCallback(
    (englishAbbr: string): string => {
      const key = `bibleAbbr.${englishAbbr}`;
      const translated = t(key);
      return translated === key ? englishAbbr : translated;
    },
    [t],
  );
}
