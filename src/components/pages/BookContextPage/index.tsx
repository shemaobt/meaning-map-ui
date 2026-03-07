import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { booksAPI, bookContextAPI } from "../../../services/api";
import { useBCDStore } from "../../../stores/bcdStore";
import { useAuth } from "../../../contexts/AuthContext";
import type { BibleBook } from "../../../types/bible";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { EmptyState } from "../../common/EmptyState";
import { Button } from "../../ui/button";
import { BCDCard } from "./BCDCard";
import { CreateBCDDialog } from "./CreateBCDDialog";

export function BookContextPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const { appRole } = useAuth();
  const { list, isLoading, fetchList } = useBCDStore();
  const [book, setBook] = useState<BibleBook | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const canManage = appRole === "admin" || appRole === "facilitator";

  useEffect(() => {
    if (!bookId) return;
    let cancelled = false;
    (async () => {
      try {
        const [books] = await Promise.all([
          booksAPI.list(),
          fetchList(bookId),
        ]);
        if (!cancelled) setBook(books.find((b) => b.id === bookId) ?? null);
      } catch {
        if (!cancelled) toast.error("Failed to load book context data.");
      }
    })();
    return () => { cancelled = true; };
  }, [bookId, fetchList]);

  const loadData = useCallback(async () => {
    if (!bookId) return;
    await fetchList(bookId);
  }, [bookId, fetchList]);

  const handleGenerate = async (bcdId: string) => {
    try {
      await bookContextAPI.generate(bcdId);
      toast.success("Generation started. This may take a few minutes.");
      await fetchList(bookId!);
    } catch (e) {
      const msg = e instanceof AxiosError ? e.response?.data?.detail : "Generation failed.";
      toast.error(msg);
    }
  };

  if (isLoading && list.length === 0) return <LoadingSpinner />;
  if (!book) return <EmptyState title="Book not found" />;

  const sortedList = [...list].sort((a, b) => b.version - a.version);

  return (
    <div className="flex flex-col h-full">
      <nav className="flex items-center gap-1 text-sm text-verde/70 mb-4">
        <Link to="/app/books" className="hover:text-telha transition-colors">
          Books
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/app/books/${book.id}`} className="hover:text-telha transition-colors">
          {book.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-preto">Book Context</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-preto">
            Book Context — {book.name}
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-verde/70">
            {list.length} version{list.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canManage && (
          <div className="flex gap-2 self-start sm:self-auto">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowCreate(true)}
              className="gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              New Version
            </Button>
          </div>
        )}
      </div>

      {sortedList.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedList.map((bcd) => (
            <div key={bcd.id}>
              <BCDCard bcd={bcd} />
              {canManage && bcd.status === "draft" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerate(bcd.id)}
                  className="mt-2 w-full gap-1 text-xs"
                >
                  <Sparkles className="h-3 w-3" />
                  Generate with AI
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Book Context Documents"
          description={
            canManage
              ? "Create the first version to get started."
              : "No context documents have been created for this book yet."
          }
          className="flex-1"
        />
      )}

      {showCreate && (
        <CreateBCDDialog
          bookId={book.id}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            loadData();
          }}
        />
      )}
    </div>
  );
}
