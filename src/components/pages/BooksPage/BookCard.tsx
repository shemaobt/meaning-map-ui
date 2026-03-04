import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BibleBook } from "../../../types/bible";
import { cn } from "../../../utils/cn";

interface BookCardProps {
  book: BibleBook;
  approvedCount: number;
  totalPericopes: number;
}

export function BookCard({ book, approvedCount, totalPericopes }: BookCardProps) {
  const navigate = useNavigate();
  const isEnabled = book.is_enabled;
  const ratio = totalPericopes > 0 ? approvedCount / totalPericopes : 0;
  const pct = Math.round(ratio * 100);

  // Animate fill on mount
  const [fillHeight, setFillHeight] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setFillHeight(ratio * 100), 80);
    return () => clearTimeout(t);
  }, [ratio]);

  return (
    <button
      disabled={!isEnabled}
      onClick={() => isEnabled && navigate(`/app/books/${book.id}`)}
      className={cn(
        "relative flex flex-col items-start justify-between rounded-xl p-2.5 sm:p-3 md:p-4 text-left transition-all aspect-[5/3] overflow-hidden",
        isEnabled
          ? "bg-surface shadow-sm border border-transparent hover:shadow-md hover:border-telha/20 cursor-pointer"
          : "bg-surface-alt border border-transparent cursor-not-allowed opacity-[0.85]"
      )}
    >
      {/* Bucket fill — rises from bottom */}
      {isEnabled && totalPericopes > 0 && (
        <div
          className={cn(
            "absolute inset-x-0 bottom-0 rounded-b-xl transition-all duration-1000 ease-out",
            "bg-gradient-to-t from-telha/18 to-telha/5",
            "dark:from-verde-claro/20 dark:to-verde-claro/6"
          )}
          style={{ height: `${fillHeight}%` }}
        />
      )}

      {/* Content — above fill */}
      <div className="relative z-10 flex w-full items-start justify-between gap-1 overflow-hidden">
        <div className="flex flex-col gap-0.5 min-w-0 shrink">
          <span className="text-sm sm:text-base font-bold text-preto leading-tight truncate">
            {book.abbreviation}
          </span>
          <span className="text-[10px] sm:text-xs text-verde/60 leading-tight block truncate">
            {book.name}
          </span>
        </div>
        <span className="rounded-full bg-areia/20 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-verde/60 shrink-0">
          {book.testament}
        </span>
      </div>

      {/* Bottom: progress bar + percentage */}
      {isEnabled && totalPericopes > 0 ? (
        <div className="relative z-10 w-full mt-auto flex items-center gap-1.5">
          <div className="flex-1 h-1 rounded-full bg-areia/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-telha dark:bg-verde-claro transition-all duration-1000 ease-out"
              style={{ width: `${fillHeight}%` }}
            />
          </div>
          <span className="text-[9px] font-semibold text-telha/70 dark:text-verde-claro/70 tabular-nums">
            {pct}%
          </span>
        </div>
      ) : (
        <div className="w-full mt-auto h-1" />
      )}
    </button>
  );
}
