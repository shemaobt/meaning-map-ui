import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import ptBR from "./locales/pt-BR.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";

export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "pt-BR", label: "Português" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LANGUAGES)[number]["code"];
export const LOCALE_STORAGE_KEY = "mm_locale";

const SUPPORTED_CODES = SUPPORTED_LANGUAGES.map((l) => l.code) as readonly string[];

function detectInitialLanguage(): string {
  const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (stored && SUPPORTED_CODES.includes(stored)) return stored;

  // Check browser languages (e.g. ["pt-BR", "pt", "en-US", "en"])
  for (const browserLang of navigator.languages ?? [navigator.language]) {
    if (SUPPORTED_CODES.includes(browserLang)) return browserLang;
    // Try base language (e.g. "pt" -> "pt-BR", "fr" -> "fr")
    const base = browserLang.split("-")[0];
    const match = SUPPORTED_CODES.find((c) => c === base || c.startsWith(base + "-"));
    if (match) return match;
  }

  return "en";
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    "pt-BR": { translation: ptBR },
    es: { translation: es },
    fr: { translation: fr },
  },
  lng: detectInitialLanguage(),
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
