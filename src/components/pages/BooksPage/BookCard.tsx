import { useNavigate } from "react-router-dom";
import type { BibleBook } from "../../../types/bible";
import { Progress } from "../../ui/progress";
import { cn } from "../../../utils/cn";

interface BookCardProps {
  book: BibleBook;
  approvedCount: number;
  totalPericopes: number;
}

export function BookCard({ book, approvedCount, totalPericopes }: BookCardProps) {
  const navigate = useNavigate();
  const isEnabled = book.is_enabled;
  const progress = totalPericopes > 0 ? Math.round((approvedCount / totalPericopes) * 100) : 0;

  return (
    <button
      disabled={!isEnabled}
      onClick={() => isEnabled && navigate(`/app/books/${book.id}`)}
      className={cn(
        "relative flex flex-col items-start justify-between rounded-xl p-2.5 sm:p-3 md:p-4 text-left transition-all aspect-[5/3]",
        isEnabled
          ? "bg-white shadow-sm border border-transparent hover:shadow-md hover:border-telha/20 cursor-pointer"
          : "bg-[#F3F2EB] border border-transparent cursor-not-allowed opacity-[0.85]"
      )}
    >
      <div className="flex w-full items-start justify-between gap-1 overflow-hidden">
        <div className="flex flex-col gap-0.5 min-w-0 shrink">
          <span className="text-sm sm:text-base font-bold text-preto leading-tight truncate">{book.abbreviation}</span>
          <span className="text-[10px] sm:text-xs text-verde/60 leading-tight block truncate">
            {book.name}
          </span>
        </div>
        <span className="rounded-full bg-[#EAE8D9] px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-verde/60 shrink-0">
          {book.testament}
        </span>
      </div>

      {isEnabled && totalPericopes > 0 ? (
        <div className="w-full mt-auto">
          <Progress value={progress} className="h-1" />
        </div>
      ) : (
        <div className="w-full mt-auto h-1" />
      )}
    </button>
  );
}
