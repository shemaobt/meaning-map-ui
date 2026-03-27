import { Globe } from "lucide-react";
import { SUPPORTED_LANGUAGES, LOCALE_STORAGE_KEY } from "../../i18n";
import i18n from "../../i18n";

export function AuthLanguageSwitcher() {
  const handleChange = (code: string) => {
    i18n.changeLanguage(code);
    localStorage.setItem(LOCALE_STORAGE_KEY, code);
  };

  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) ?? SUPPORTED_LANGUAGES[0];

  return (
    <div className="fixed top-4 right-4 flex items-center gap-1">
      <Globe className="h-4 w-4 text-verde/50" />
      <select
        value={current.code}
        onChange={(e) => handleChange(e.target.value)}
        className="appearance-none bg-transparent text-sm text-verde/70 hover:text-verde cursor-pointer focus:outline-none"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}
