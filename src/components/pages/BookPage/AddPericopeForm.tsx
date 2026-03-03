import { useState } from "react";
import { toast } from "sonner";
import { pericopesAPI } from "../../../services/api";
import type { BibleBook } from "../../../types/bible";
import { Button } from "../../ui/button";

interface AddPericopeFormProps {
    book: BibleBook;
    onSuccess: () => void;
    onCancel: () => void;
}

export function AddPericopeForm({ book, onSuccess, onCancel }: AddPericopeFormProps) {
    const [chapterStart, setChapterStart] = useState<number>(1);
    const [chapterEnd, setChapterEnd] = useState<number>(1);
    const [verseStart, setVerseStart] = useState<number>(1);
    const [verseEnd, setVerseEnd] = useState<number>(1);
    const [title, setTitle] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const reference = chapterStart === chapterEnd
        ? `${book.abbreviation} ${chapterStart}:${verseStart}–${verseEnd}`
        : `${book.abbreviation} ${chapterStart}:${verseStart}–${chapterEnd}:${verseEnd}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (chapterEnd < chapterStart) {
            toast.error("Chapter end must be ≥ chapter start.");
            return;
        }
        if (chapterEnd === chapterStart && verseEnd < verseStart) {
            toast.error("Verse end must be ≥ verse start within the same chapter.");
            return;
        }
        setSubmitting(true);
        try {
            await pericopesAPI.create({
                book_id: book.id,
                chapter_start: chapterStart,
                verse_start: verseStart,
                chapter_end: chapterEnd,
                verse_end: verseEnd,
                reference,
                title: title.trim() || undefined,
            });
            toast.success(`Pericope "${reference}" created.`);
            onSuccess();
        } catch {
            toast.error("Failed to create pericope.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full rounded-md border border-areia/40 bg-white px-3 py-2 text-sm text-preto placeholder:text-verde/40 focus:outline-none focus:ring-2 focus:ring-telha/30";

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-telha/20 bg-white p-4 shadow-sm"
        >
            <h4 className="text-sm font-semibold text-preto mb-4">Add Pericope</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-verde/70">Chapter start</span>
                    <input
                        type="number"
                        min={1}
                        max={book.chapter_count}
                        value={chapterStart}
                        onChange={(e) => {
                            const newStart = Number(e.target.value);
                            setChapterStart(newStart);
                            if (chapterEnd < newStart) {
                                setChapterEnd(newStart);
                            }
                        }}
                        className={inputClass}
                        required
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-verde/70">Verse start</span>
                    <input
                        type="number"
                        min={1}
                        value={verseStart}
                        onChange={(e) => setVerseStart(Number(e.target.value))}
                        className={inputClass}
                        required
                    />
                </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-verde/70">Chapter end</span>
                    <input
                        type="number"
                        min={chapterStart}
                        max={book.chapter_count}
                        value={chapterEnd}
                        onChange={(e) => setChapterEnd(Number(e.target.value))}
                        className={inputClass}
                        required
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-verde/70">Verse end</span>
                    <input
                        type="number"
                        min={1}
                        value={verseEnd}
                        onChange={(e) => setVerseEnd(Number(e.target.value))}
                        className={inputClass}
                        required
                    />
                </label>
            </div>

            <label className="flex flex-col gap-1 mb-1">
                <span className="text-xs text-verde/70">Title (optional)</span>
                <input
                    type="text"
                    placeholder="e.g. Naomi's return"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                    maxLength={300}
                />
            </label>

            <p className="text-xs text-verde/50 mb-4">
                Reference: <span className="font-medium text-preto">{reference}</span>
            </p>

            <div className="flex gap-2 justify-end">
                <Button type="button" size="sm" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? "Saving…" : "Add Pericope"}
                </Button>
            </div>
        </form>
    );
}
