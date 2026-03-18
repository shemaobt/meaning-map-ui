import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { bookContextAPI } from "../../../services/api";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";

const GENRE_OPTIONS = [
  "narrative",
  "poetry",
  "prophecy",
  "wisdom",
  "law",
  "apocalyptic",
];

interface CreateBCDDialogProps {
  bookId: string;
  onClose: () => void;
  onCreated: () => void;
}

export function CreateBCDDialog({ bookId, onClose, onCreated }: CreateBCDDialogProps) {
  const { t } = useTranslation();
  const [genre, setGenre] = useState("narrative");
  const [sectionLabel, setSectionLabel] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await bookContextAPI.create(bookId, {
        genre,
        section_label: sectionLabel || undefined,
      });
      toast.success(t("bookContext.createSuccess"));
      onCreated();
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.detail : t("bookContext.createFailed");
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-surface rounded-lg border border-areia/30 shadow-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-preto mb-4">
          {t("bookContext.createTitle")}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-preto mb-2">
              {t("bookContext.genreLabel")}
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full rounded-md border border-areia bg-surface px-3 py-2 text-sm focus:ring-2 focus:ring-telha focus:border-telha"
            >
              {GENRE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-preto mb-2">
              {t("bookContext.sectionLabelLabel")}
            </label>
            <Input
              value={sectionLabel}
              onChange={(e) => setSectionLabel(e.target.value)}
              placeholder={t("bookContext.sectionLabelPlaceholder")}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? t("common.creating") : t("common.create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
