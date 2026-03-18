import { useEffect, useState, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";
import { booksAPI, bookContextAPI } from "../../../services/api";
import type { BCDListItem } from "../../../types/bookContext";
import type { BibleBook, PericopeWithStatus } from "../../../types/bible";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { EmptyState } from "../../common/EmptyState";
import { toast } from "sonner";
import { ChevronRight, Loader2, Plus, ShieldAlert, Sparkles } from "lucide-react";
import { PericopeCard } from "./PericopeCard";
import { AddPericopeForm } from "./AddPericopeForm";
import { layout } from "../../../styles";
import { Button } from "../../ui/button";
import { useBookName } from "../../../hooks/useBookName";

export function BookPage() {
  const { t } = useTranslation();
  const translateBook = useBookName();
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<BibleBook | null>(null);
  const [pericopes, setPericopes] = useState<PericopeWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [latestBCD, setLatestBCD] = useState<BCDListItem | null>(null);
  const [hasApprovedBCD, setHasApprovedBCD] = useState(false);
  const [bcdLoading, setBcdLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();
  const bcdLoadedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!bookId) return;
    try {
      const [books, pericopeList] = await Promise.all([
        booksAPI.list(),
        booksAPI.getAllPericopes(bookId),
      ]);
      setBook(books.find((b) => b.id === bookId) ?? null);
      setPericopes(pericopeList);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!bookId || bcdLoadedRef.current) return;
    bcdLoadedRef.current = true;

    (async () => {
      try {
        const bcds = await bookContextAPI.list(bookId);
        const sorted = bcds.sort((a, b) => b.version - a.version);
        setLatestBCD(sorted[0] ?? null);
        setHasApprovedBCD(bcds.some((b) => b.status === "approved"));
      } catch {
        // silently fail
      } finally {
        setBcdLoading(false);
      }
    })();

    return () => { bcdLoadedRef.current = false; };
  }, [bookId]);

  if (loading) return <LoadingSpinner />;
  if (!book) return <EmptyState title={t("bookPage.notFound")} />;

  return (
    <div className="flex flex-col h-full">
      <nav className="flex items-center gap-1 text-sm text-verde/70 mb-4">
        <Link to="/app/dashboard" className="hover:text-telha">
          {t("nav.dashboard")}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-preto">{translateBook(book.name)}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
        <h2 className="text-xl sm:text-2xl font-bold text-preto">{translateBook(book.name)}</h2>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={async () => {
              if (latestBCD) {
                navigate(`/app/book-context/${latestBCD.id}`);
              } else if (bookId) {
                setCreating(true);
                try {
                  const bcd = await bookContextAPI.create(bookId, { genre: "narrative" });
                  navigate(`/app/book-context/${bcd.id}`);
                } catch {
                  toast.error(t("bookPage.bcdCreateFailed"));
                } finally {
                  setCreating(false);
                }
              }
            }}
            disabled={bcdLoading || creating}
            className="inline-flex items-center gap-1.5 rounded-full border border-areia/30 bg-surface px-3.5 py-1.5 text-xs font-medium text-verde hover:border-telha/30 hover:text-telha transition-all shadow-sm disabled:opacity-50"
          >
            {(bcdLoading || creating) ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            {t("bookPage.bookContext")}
            {latestBCD && (
              <>
                <span className="text-verde/40 font-normal">v{latestBCD.version}</span>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  latestBCD.status === "approved" ? "bg-verde-claro" :
                  latestBCD.status === "generating" ? "bg-amber-400 animate-pulse" :
                  latestBCD.status === "review" ? "bg-azul" :
                  "bg-areia"
                }`} />
              </>
            )}
          </button>
          {hasApprovedBCD && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm((v) => !v)}
              className="flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("bookPage.addPericope")}
            </Button>
          )}
        </div>
      </div>
      <p className="mt-1 text-xs sm:text-sm text-verde/70 mb-4 sm:mb-6">
        {book.chapter_count} {t("bookPage.chapters")} • {pericopes.length} {t(pericopes.length !== 1 ? "bookPage.pericopes" : "bookPage.pericope")}
      </p>

      {showAddForm && (
        <div className="mb-6">
          <AddPericopeForm
            book={book}
            onSuccess={() => {
              setShowAddForm(false);
              fetchData();
            }}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {pericopes.length > 0 ? (
        <div className={`${layout.grid.pericopes}`}>
          {pericopes.map((p) => (
            <PericopeCard
              key={p.id}
              pericope={p}
              onRefresh={fetchData}
            />
          ))}
        </div>
      ) : !bcdLoading && !hasApprovedBCD ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <ShieldAlert className="h-10 w-10 text-areia mb-3" />
          <h3 className="text-sm font-semibold text-preto mb-1">{t("bookPage.bcdNotApproved")}</h3>
          <p className="text-xs text-verde/50 max-w-sm">
            {t("bookPage.bcdNotApprovedMessage")}
          </p>
        </div>
      ) : (
        <EmptyState
          title={t("bookPage.noPericopes")}
          description={t("bookPage.noPericopesMessage")}
          className="flex-1"
        />
      )}
    </div>
  );
}
