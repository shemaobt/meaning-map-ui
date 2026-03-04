import { useMemo } from "react";
import { useBHSAStore } from "../../../stores/bhsaStore";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { PanelRightClose, AlertCircle } from "lucide-react";
import { cn } from "../../../utils/cn";
import type { BHSAClause } from "../../../types/bhsa";

function VerseGroup({ verse, clauses }: { verse: number; clauses: BHSAClause[] }) {
  return (
    <div className="space-y-1">
      <div className="sticky top-0 z-10 bg-surface-alt/95 backdrop-blur-sm px-1 py-0.5">
        <span className="text-[10px] font-semibold text-verde/40 uppercase tracking-widest">
          Verse {verse}
        </span>
      </div>
      {clauses.map((clause) => (
        <div
          key={clause.clause_id}
          className={cn(
            "rounded border px-2.5 py-2 space-y-1",
            clause.is_mainline
              ? "border-telha/20 bg-telha/[0.06]"
              : "border-areia/15 bg-surface",
          )}
        >
          <div className="flex items-center gap-1 flex-wrap">
            <span
              className={cn(
                "text-[10px] font-mono font-medium px-1.5 py-px rounded",
                clause.is_mainline
                  ? "bg-telha/15 text-telha"
                  : "bg-areia/20 text-verde/60",
              )}
            >
              {clause.clause_type}
            </span>
            {clause.is_mainline && (
              <span className="text-[9px] text-telha/70 font-medium">
                mainline
              </span>
            )}
            {clause.subjects.map((s) => (
              <span key={s} className="text-[10px] px-1.5 py-px rounded-full bg-azul/15 text-azul">
                {s}
              </span>
            ))}
            {clause.objects.map((o) => (
              <span key={o} className="text-[10px] px-1.5 py-px rounded-full bg-verde-claro/15 text-verde-claro">
                {o}
              </span>
            ))}
          </div>

          <p className="text-[15px] font-serif leading-relaxed text-preto" dir="rtl" lang="he">
            {clause.text}
          </p>

          <p className="text-[11px] text-verde/50 leading-snug italic">
            {clause.gloss}
          </p>

          {clause.names.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {clause.names.map((name) => (
                <span
                  key={name}
                  className="text-[10px] px-1.5 py-px rounded-full bg-areia/20 text-preto/70"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function BHSASidebar() {
  const { isSidebarOpen, pericopeRef, pericopeData, pericopeLoading, toggleSidebar } =
    useBHSAStore();

  const verseGroups = useMemo(() => {
    if (!pericopeData?.clauses.length) return [];
    const groups: { verse: number; clauses: BHSAClause[] }[] = [];
    let current: { verse: number; clauses: BHSAClause[] } | null = null;
    for (const clause of pericopeData.clauses) {
      if (!current || current.verse !== clause.verse) {
        current = { verse: clause.verse, clauses: [] };
        groups.push(current);
      }
      current.clauses.push(clause);
    }
    return groups;
  }, [pericopeData]);

  if (!isSidebarOpen) return null;

  return (
    <aside className="w-80 lg:w-96 flex-shrink-0 hidden md:block self-stretch">
      <div className="sticky top-0 h-[100vh] flex flex-col rounded-lg border border-areia/30 bg-surface-alt shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-areia/20 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-lg font-serif text-telha/80 leading-none select-none" dir="rtl" lang="he">א</span>
            <div>
              <h3 className="text-sm font-semibold text-preto tracking-tight">
                Hebrew Text
              </h3>
              {pericopeRef && (
                <p className="text-[11px] text-verde/50 mt-px">{pericopeRef}</p>
              )}
            </div>
          </div>
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-areia/20 transition-colors text-verde/50 hover:text-preto"
            title="Collapse sidebar"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {pericopeLoading && (
            <div className="py-12">
              <LoadingSpinner />
            </div>
          )}

          {!pericopeLoading && !pericopeData && (
            <div className="py-12 text-center text-sm text-verde/50">
              <AlertCircle className="h-5 w-5 mx-auto mb-2 opacity-50" />
              <p>Hebrew data unavailable</p>
            </div>
          )}

          {verseGroups.map((group) => (
            <VerseGroup key={group.verse} verse={group.verse} clauses={group.clauses} />
          ))}
        </div>

        {pericopeData && (
          <div className="flex-shrink-0 px-4 py-2 border-t border-areia/15 text-[10px] text-verde/40 text-center">
            {pericopeData.clauses.length} clauses · {verseGroups.length} verses
          </div>
        )}
      </div>
    </aside>
  );
}

export function BHSASidebarToggle() {
  const { isSidebarOpen, pericopeRef, toggleSidebar } = useBHSAStore();

  if (isSidebarOpen) return null;

  return (
    <button
      onClick={toggleSidebar}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col items-center gap-1 px-1.5 py-3 rounded-l-lg bg-surface border border-r-0 border-areia/30 text-preto shadow-lg hover:bg-surface-alt transition-colors"
      title={pericopeRef ? `Hebrew Text — ${pericopeRef}` : "Show Hebrew text"}
    >
      <span className="text-base font-serif text-telha leading-none select-none" dir="rtl" lang="he">א</span>
      <span className="text-[9px] font-medium text-verde/60 tracking-wide [writing-mode:vertical-lr] rotate-180">
        BHSA
      </span>
    </button>
  );
}
