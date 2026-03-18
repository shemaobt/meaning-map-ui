import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { SUPPORTED_LANGUAGES, LOCALE_STORAGE_KEY } from "../../i18n";
import type { SupportedLocale } from "../../i18n";
import { authAPI } from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import i18n from "../../i18n";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

export function LanguagePickerDialog() {
  const { t } = useTranslation();
  const { refreshUser } = useAuth();
  const [selected, setSelected] = useState<SupportedLocale>(
    (i18n.language as SupportedLocale) || "en",
  );
  const [saving, setSaving] = useState(false);

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await authAPI.updateMe({ locale: selected });
      i18n.changeLanguage(selected);
      localStorage.setItem(LOCALE_STORAGE_KEY, selected);
      await refreshUser();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open>
      <DialogContent
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className="[&>button:last-child]:hidden max-w-sm"
      >
        <DialogHeader className="text-center sm:text-center">
          <DialogTitle>{t("i18n.languagePicker.title")}</DialogTitle>
          <DialogDescription>
            {t("i18n.languagePicker.subtitle")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-2">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setSelected(lang.code)}
              className={`rounded-md border px-3 py-3 text-center text-sm font-medium transition-all ${
                selected === lang.code
                  ? "border-telha bg-telha/10 text-telha"
                  : "border-areia/30 text-preto hover:border-telha/30 dark:text-branco"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <DialogFooter className="border-t border-areia/10 pt-4 mt-1 sm:justify-center">
          <Button onClick={handleConfirm} disabled={saving} className="w-full sm:w-auto">
            {saving ? t("common.saving") : t("i18n.languagePicker.confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
