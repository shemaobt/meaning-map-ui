import { useState } from "react";
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
      toast.success("Book Context Document created.");
      onCreated();
    } catch (err) {
      const msg = err instanceof AxiosError ? err.response?.data?.detail : "Failed to create.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-surface rounded-lg border border-areia/30 shadow-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold text-preto mb-4">
          Create Book Context Document
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-preto mb-2">
              Genre
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
              Section Label (optional)
            </label>
            <Input
              value={sectionLabel}
              onChange={(e) => setSectionLabel(e.target.value)}
              placeholder="e.g. Chapters 1-4"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
