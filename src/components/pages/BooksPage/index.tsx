import { useEffect, useState } from "react";
import { booksAPI } from "../../../services/api";
import type { BibleBook } from "../../../types/bible";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { BookCard } from "./BookCard";

export function BooksPage() {
  const [books, setBooks] = useState<BibleBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    booksAPI
      .list()
      .then(setBooks)
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const otBooks = books.filter((b) => b.testament === "OT");
  const ntBooks = books.filter((b) => b.testament === "NT");

  return (
    <div>
      <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-8">
        <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-areia/20 text-telha shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="sm:w-6 sm:h-6"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-preto">Books</h2>
          <p className="text-xs sm:text-sm text-verde/70">Select a book to begin working on meaning maps.</p>
        </div>
      </div>

      <section>
        <h3 className="text-xs font-bold text-verde/60 uppercase tracking-widest mb-3 sm:mb-4">
          OLD TESTAMENT
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
          {otBooks.map((book) => (
            <BookCard key={book.id} book={book} approvedCount={book.approved_count} totalPericopes={book.pericope_count} />
          ))}
        </div>
      </section>

      <section className="mt-6 sm:mt-10">
        <div className="flex items-center gap-3 mb-3 sm:mb-4">
          <h3 className="text-xs font-bold text-verde/60 uppercase tracking-widest">
            NEW TESTAMENT
          </h3>
          <span className="rounded-full bg-areia/30 px-2.5 py-0.5 text-[10px] font-semibold text-verde/60">
            Coming Soon
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
          {ntBooks.map((book) => (
            <BookCard key={book.id} book={book} approvedCount={book.approved_count} totalPericopes={book.pericope_count} />
          ))}
        </div>
      </section>
    </div>
  );
}
