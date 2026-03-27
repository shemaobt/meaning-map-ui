import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Check, Globe, Menu, Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { NotificationBell } from "./NotificationBell";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { SUPPORTED_LANGUAGES, LOCALE_STORAGE_KEY } from "../../i18n";
import { authAPI } from "../../services/api";
import i18n from "../../i18n";

interface AppHeaderProps {
  onToggleSidebar: () => void;
}

export function AppHeader({ onToggleSidebar }: AppHeaderProps) {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const { refreshUser } = useAuth();
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ?? SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    if (langOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [langOpen]);

  const handleLanguageChange = async (code: string) => {
    setLangOpen(false);
    i18n.changeLanguage(code);
    localStorage.setItem(LOCALE_STORAGE_KEY, code);
    try {
      await authAPI.updateMe({ locale: code });
      await refreshUser();
    } catch {
      // locale saved locally even if backend fails
    }
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-areia/30 bg-branco px-4">
      <div className="flex w-1/3 items-center">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onToggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex w-1/3 items-center justify-center">
        <h1 className="text-xl font-bold tracking-tight text-preto">
          <span className="text-telha">{t("app.titleBible")}</span> {t("app.titleMeaningMaps")}
        </h1>
      </div>

      <div className="flex w-1/3 items-center justify-end gap-1">
        <div className="relative" ref={langRef}>
          <button
            onClick={() => setLangOpen((o) => !o)}
            className="flex items-center gap-1 rounded-md px-1.5 py-1.5 text-sm text-verde hover:bg-areia/20 transition-colors"
            aria-label="Change language"
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-medium uppercase">
              {currentLang.code === "pt-BR" ? "PT" : currentLang.code.toUpperCase()}
            </span>
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-lg border border-areia/30 bg-white py-1 shadow-lg dark:border-white/10 dark:bg-[#2a2a22]">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isActive = lang.code === i18n.language;
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? "font-semibold text-telha"
                        : "text-preto hover:bg-areia/10 dark:text-white/90 dark:hover:bg-white/10"
                    }`}
                  >
                    {lang.label}
                    {isActive && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <button
          onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
          className="rounded-md p-1.5 text-verde hover:bg-areia/20 transition-colors"
          aria-label={t("layout.header.toggleDarkMode")}
        >
          {resolvedTheme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </button>
        <NotificationBell />
      </div>
    </header>
  );
}
