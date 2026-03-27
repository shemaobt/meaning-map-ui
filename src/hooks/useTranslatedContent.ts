import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { meaningMapsAPI, bookContextAPI } from "../services/api";

type DocumentType = "meaning-map" | "book-context";

interface TranslatedContentResult {
  content: Record<string, unknown>;
  isTranslating: boolean;
}

export function useTranslatedContent(
  document: { id: string; data?: Record<string, unknown>; translations?: Record<string, unknown> | null } | null,
  documentType: DocumentType,
): TranslatedContentResult {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const [translatedContent, setTranslatedContent] = useState<Record<string, unknown> | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const originalContent = documentType === "meaning-map" ? document?.data : document;
  const docId = document?.id;
  const cachedTranslation = document?.translations?.[locale] as Record<string, unknown> | undefined;

  useEffect(() => {
    if (!docId || !originalContent) return;

    if (locale === "en") {
      setTranslatedContent(null);
      setIsTranslating(false);
      return;
    }

    if (cachedTranslation) {
      setTranslatedContent(cachedTranslation);
      setIsTranslating(false);
      return;
    }

    let cancelled = false;
    setIsTranslating(true);

    const translate = async () => {
      try {
        const api = documentType === "meaning-map" ? meaningMapsAPI : bookContextAPI;
        const result = await api.translate(docId, locale);
        if (!cancelled) {
          setTranslatedContent(result.data);
        }
      } catch {
        // fall back to original content on error
      } finally {
        if (!cancelled) setIsTranslating(false);
      }
    };

    translate();
    return () => { cancelled = true; };
  }, [docId, locale, cachedTranslation, documentType, originalContent]);

  if (locale === "en" || !document) {
    return { content: (originalContent ?? {}) as Record<string, unknown>, isTranslating: false };
  }

  return {
    content: (translatedContent ?? cachedTranslation ?? originalContent ?? {}) as Record<string, unknown>,
    isTranslating,
  };
}
