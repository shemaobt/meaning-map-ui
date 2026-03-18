import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { bhsaAPI, pericopesAPI } from "../../../services/api";
import type { BibleBook } from "../../../types/bible";
import { Button } from "../../ui/button";

interface AddPericopeFormProps {
    book: BibleBook;
    onSuccess: () => void;
    onCancel: () => void;
}

export function AddPericopeForm({ book, onSuccess, onCancel }: AddPericopeFormProps) {
    const { t } = useTranslation();
    const [chapterStart, setChapterStart] = useState<number>(1);
    const [chapterEnd, setChapterEnd] = useState<number>(1);
    const [verseStart, setVerseStart] = useState<number>(1);
    const [verseEnd, setVerseEnd] = useState<number>(1);
    const [title, setTitle] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [verseCounts, setVerseCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        bhsaAPI.getVerseCounts(book.name).then(setVerseCounts).catch(() => {});
    }, [book.name]);

    const maxVerseStart = verseCounts[String(chapterStart)] ?? 176;
    const maxVerseEnd = verseCounts[String(chapterEnd)] ?? 176;

    const reference = chapterStart === chapterEnd
        ? `${book.abbreviation} ${chapterStart}:${verseStart}\u2013${verseEnd}`
        : `${book.abbreviation} ${chapterStart}:${verseStart}\u2013${chapterEnd}:${verseEnd}`;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (chapterEnd < chapterStart) {
            toast.error(t("addPericope.chapterValidation"));
            return;
        }
        if (chapterEnd === chapterStart && verseEnd < verseStart) {
            toast.error(t("addPericope.verseValidation"));
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
            toast.success(t("addPericope.success", { reference }));
            onSuccess();
        } catch {
            toast.error(t("addPericope.failed"));
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass =
        "w-full rounded-md border border-areia/40 bg-surface px-3 py-2 text-sm text-preto placeholder:text-verde/40 focus:outline-none focus:ring-2 focus:ring-telha/30";

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-telha/20 bg-surface p-4 shadow-sm"
        >
            <h4 className="text-sm font-semibold text-preto mb-4">{t("addPericope.title")}</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-verde/70">{t("addPericope.chapterStartLabel")}</span>
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
                            const max = verseCounts[String(newStart)];
                            if (max && verseStart > max) setVerseStart(max);
                        }}
                        className={inputClass}
                        required
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-verde/70">{t("addPericope.verseStartLabel")}</span>
                    <input
                        type="number"
                        min={1}
                        max={maxVerseStart}
                        value={verseStart}
                        onChange={(e) => setVerseStart(Number(e.target.value))}
                        className={inputClass}
                        required
                    />
                </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-verde/70">{t("addPericope.chapterEndLabel")}</span>
                    <input
                        type="number"
                        min={chapterStart}
                        max={book.chapter_count}
                        value={chapterEnd}
                        onChange={(e) => {
                            const newEnd = Number(e.target.value);
                            setChapterEnd(newEnd);
                            const max = verseCounts[String(newEnd)];
                            if (max && verseEnd > max) setVerseEnd(max);
                        }}
                        className={inputClass}
                        required
                    />
                </label>
                <label className="flex flex-col gap-1">
                    <span className="text-xs text-verde/70">{t("addPericope.verseEndLabel")}</span>
                    <input
                        type="number"
                        min={1}
                        max={maxVerseEnd}
                        value={verseEnd}
                        onChange={(e) => setVerseEnd(Number(e.target.value))}
                        className={inputClass}
                        required
                    />
                </label>
            </div>

            <label className="flex flex-col gap-1 mb-1">
                <span className="text-xs text-verde/70">{t("addPericope.titleLabel")}</span>
                <input
                    type="text"
                    placeholder={t("addPericope.titlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className={inputClass}
                    maxLength={300}
                />
            </label>

            <p className="text-xs text-verde/50 mb-4">
                {t("addPericope.reference", { reference })}
            </p>

            <div className="flex gap-2 justify-end">
                <Button type="button" size="sm" variant="outline" onClick={onCancel}>
                    {t("common.cancel")}
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                    {submitting ? t("common.saving") : t("addPericope.title")}
                </Button>
            </div>
        </form>
    );
}
