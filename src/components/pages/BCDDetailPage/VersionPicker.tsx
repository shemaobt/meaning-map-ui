import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, ChevronDown, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { bookContextAPI } from "../../../services/api";
import { useBCDStore } from "../../../stores/bcdStore";
import type { BCDListItem } from "../../../types/bookContext";
import { cn } from "../../../utils/cn";
import { BCDStatusBadge } from "../BookContextPage/BCDStatusBadge";

interface VersionPickerProps {
  currentBCDId: string;
  bookId: string;
  currentVersion: number;
  isActive: boolean;
  canManage: boolean;
}

export function VersionPicker({ currentBCDId, bookId, currentVersion, isActive, canManage }: VersionPickerProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<BCDListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    bookContextAPI.list(bookId).then((list) => {
      setVersions(list.sort((a, b) => b.version - a.version));
    }).finally(() => setLoading(false));
  }, [open, bookId]);

  const handleSetActive = async () => {
    setActivating(true);
    try {
      const updated = await bookContextAPI.setActive(currentBCDId);
      useBCDStore.setState({ currentBCD: updated });
      toast.success("This version is now the active context for pericopes.");
    } catch {
      toast.error("Failed to set active version.");
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        {isActive && (
          <span className="flex items-center gap-1 text-[10px] font-medium text-verde-claro bg-verde-claro/10 rounded-full px-2 py-0.5">
            <Crown className="h-2.5 w-2.5" />
            Active
          </span>
        )}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 text-xs text-verde/60 hover:text-telha transition-colors rounded-md border border-areia/20 px-2.5 py-1.5 bg-surface"
        >
          v{currentVersion}
          <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
        </button>
        {canManage && !isActive && (
          <button
            onClick={handleSetActive}
            disabled={activating}
            className="flex items-center gap-1 text-[10px] text-verde/40 hover:text-telha transition-colors disabled:opacity-50"
          >
            {activating ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Crown className="h-2.5 w-2.5" />}
            Set active
          </button>
        )}
      </div>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-72 rounded-lg border border-areia/30 bg-surface shadow-lg overflow-hidden">
            <div className="px-3 py-2 border-b border-areia/20">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-verde/40">All Versions</p>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-4 w-4 animate-spin text-verde/30" />
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {versions.map((v) => {
                  const isCurrent = v.id === currentBCDId;
                  return (
                    <button
                      key={v.id}
                      onClick={() => {
                        if (!isCurrent) navigate(`/app/book-context/${v.id}`);
                        setOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-alt transition-colors text-xs",
                        isCurrent && "bg-surface-alt",
                      )}
                    >
                      <span className={cn(
                        "flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold",
                        isCurrent ? "bg-telha/15 text-telha" : "bg-areia/15 text-verde/50",
                      )}>
                        {v.version}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("font-medium", isCurrent ? "text-preto" : "text-verde/70")}>
                            Version {v.version}
                          </span>
                          {v.is_active && (
                            <Crown className="h-2.5 w-2.5 text-verde-claro flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-verde/40 mt-0.5">
                          {new Date(v.updated_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                        </p>
                      </div>
                      <BCDStatusBadge status={v.status} />
                      {isCurrent && <Check className="h-3 w-3 text-telha flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
