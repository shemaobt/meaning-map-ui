import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { booksAPI } from "../../../services/api";
import type { BibleBook, PericopeWithStatus } from "../../../types/bible";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { EmptyState } from "../../common/EmptyState";
import { ChevronRight, Plus } from "lucide-react";
import { PericopeCard } from "./PericopeCard";
import { AddPericopeForm } from "./AddPericopeForm";
import { layout } from "../../../styles";
import { Button } from "../../ui/button";

export function BookPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const [book, setBook] = useState<BibleBook | null>(null);
  const [pericopes, setPericopes] = useState<PericopeWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

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

  if (loading) return <LoadingSpinner />;
  if (!book) return <EmptyState title="Book not found" />;

  return (
    <div className="flex flex-col h-full">
      <nav className="flex items-center gap-1 text-sm text-verde/70 mb-4">
        <Link to="/app/dashboard" className="hover:text-telha">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-preto">{book.name}</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
        <h2 className="text-xl sm:text-2xl font-bold text-preto">{book.name}</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowAddForm((v) => !v)}
          className="flex items-center gap-1 self-start sm:self-auto"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Pericope
        </Button>
      </div>
      <p className="mt-1 text-xs sm:text-sm text-verde/70 mb-4 sm:mb-6">
        {book.chapter_count} chapters • {pericopes.length} pericope{pericopes.length !== 1 ? "s" : ""}
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
      ) : (
        <EmptyState
          title="No pericopes"
          description="No pericopes registered for this book."
          className="flex-1"
        />
      )}
    </div>
  );
}
