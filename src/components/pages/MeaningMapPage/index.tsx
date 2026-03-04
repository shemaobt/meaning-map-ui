import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { meaningMapsAPI } from "../../../services/api";
import { useMeaningMapStore } from "../../../stores/meaningMapStore";
import { useBHSAStore } from "../../../stores/bhsaStore";
import { useAuth } from "../../../contexts/AuthContext";
import { StatusBadge } from "../../common/StatusBadge";
import { LockBadge } from "../../common/LockBadge";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { ReviewTab } from "./ReviewTab";
import { BHSASidebar, BHSASidebarToggle } from "./BHSASidebar";
import { ChevronRight, Clock, Eye, Pencil } from "lucide-react";
import type { MeaningMapStatus } from "../../../types/bible";

function parsePericopeRef(ref: string, bookName: string) {
  // Parses "Ruth 4:1-5" or "Ruth 4:1–5" (en-dash) → { book, chapter, verseStart, verseEnd }
  const match = ref.match(/(\d+):(\d+)[-–](\d+)$/);
  if (!match) return null;
  return {
    book: bookName,
    chapter: parseInt(match[1], 10),
    verseStart: parseInt(match[2], 10),
    verseEnd: parseInt(match[3], 10),
  };
}

export function MeaningMapPage() {
  const { mapId } = useParams<{ mapId: string }>();
  const { user } = useAuth();
  const currentMap = useMeaningMapStore((s) => s.currentMap);
  const [loading, setLoading] = useState(true);

  const fetchMap = useCallback(async () => {
    if (!mapId) {
      setLoading(false);
      return;
    }
    try {
      const mm = await meaningMapsAPI.get(mapId);
      useMeaningMapStore.getState().setFromBackend(mm);
    } catch (err) {
      console.error("Failed to load meaning map:", err);
    } finally {
      setLoading(false);
    }
  }, [mapId]);

  useEffect(() => {
    fetchMap();
    return () => useMeaningMapStore.getState().clear();
  }, [fetchMap]);

  // Auto-load BHSA data for this pericope
  useEffect(() => {
    if (!currentMap?.pericope_reference || !currentMap?.book_name) return;
    const parsed = parsePericopeRef(currentMap.pericope_reference, currentMap.book_name);
    if (parsed) {
      useBHSAStore.getState().loadPericope(parsed.book, parsed.chapter, parsed.verseStart, parsed.verseEnd);
    }
  }, [currentMap?.pericope_reference, currentMap?.book_name]);

  if (loading) return <LoadingSpinner />;
  if (!currentMap) {
    return (
      <div className="text-center py-12 text-verde/50">
        <p className="text-sm">Meaning map not found.</p>
        <Link to="/app/books" className="text-telha text-sm hover:underline mt-2 inline-block">
          Back to books
        </Link>
      </div>
    );
  }

  const isAnalyst = currentMap.analyst_id === user?.id;
  const isLockedByMe = currentMap.locked_by === user?.id;
  const isCrossChecker = currentMap.status === "cross_check" && isLockedByMe && !isAnalyst;

  // Content is editable ONLY when: you're the analyst AND you hold the lock AND it's draft
  const canEdit = isAnalyst && isLockedByMe && currentMap.status === "draft";
  const contentReadOnly = !canEdit;
  // Actions bar is visible for: analyst editing OR cross-checker reviewing
  const actionsHidden = !isLockedByMe || currentMap.status === "approved";

  const bookName = currentMap.book_name ?? "Book";
  const pericopeRef = currentMap.pericope_reference ?? "Pericope";
  const bookId = currentMap.book_id;
  const updatedAt = new Date(currentMap.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex gap-6 items-start">
      <div className="flex-1 min-w-0">
        <nav className="flex items-center gap-1 text-sm text-verde/70 mb-4">
          <Link to="/app/books" className="hover:text-telha transition-colors">
            Books
          </Link>
          <ChevronRight className="h-3 w-3" />
          {bookId ? (
            <Link to={`/app/books/${bookId}`} className="hover:text-telha transition-colors">
              {bookName}
            </Link>
          ) : (
            <span>{bookName}</span>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-preto">{pericopeRef}</span>
        </nav>

        {isLockedByMe && (
          <RoleBanner isCrossChecker={isCrossChecker} />
        )}

        <div className="bg-surface rounded-lg border border-areia/30 shadow-sm p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-preto tracking-tight">
                {pericopeRef}
              </h2>
              <p className="text-sm text-verde mt-0.5">{bookName}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <StatusBadge status={currentMap.status as MeaningMapStatus} />
              <LockBadge lockedBy={currentMap.locked_by} lockedByName={null} />
            </div>
          </div>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-areia/20 text-xs text-verde/60">
            <span>Version {currentMap.version}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {updatedAt}
            </span>
          </div>
        </div>

        <ReviewTab
          readOnly={contentReadOnly}
          actionsHidden={actionsHidden}
          isCrossChecker={isCrossChecker}
          isAnalyst={isAnalyst}
          onRefresh={fetchMap}
        />
      </div>

      <BHSASidebar />
      <BHSASidebarToggle />
    </div>
  );
}

function RoleBanner({ isCrossChecker }: { isCrossChecker: boolean }) {
  if (isCrossChecker) {
    return (
      <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg bg-azul/10 border border-azul/20 text-sm text-azul">
        <Eye className="h-4 w-4 flex-shrink-0" />
        <span>
          <span className="font-semibold">Cross-checker mode</span> — Review the content and leave
          feedback. You can approve or request revisions.
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-lg bg-verde-claro/10 border border-verde-claro/20 text-sm text-verde">
      <Pencil className="h-4 w-4 flex-shrink-0" />
      <span>
        <span className="font-semibold">Analyst mode</span> — You can edit the content and save
        changes.
      </span>
    </div>
  );
}
