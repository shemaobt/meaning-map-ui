import { useBHSAStore } from "../../stores/bhsaStore";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { Badge } from "../ui/badge";

export function BHSAPanel() {
  const { isPanelOpen, panelRef, panelData, closePanel } = useBHSAStore();

  return (
    <Sheet open={isPanelOpen} onOpenChange={(open) => !open && closePanel()}>
      <SheetContent side="right" className="w-full max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Hebrew Analysis</SheetTitle>
          {panelRef && <p className="text-sm text-verde/70">{panelRef}</p>}
        </SheetHeader>

        <div className="mt-4 space-y-4">
          {!panelData ? (
            <LoadingSpinner />
          ) : (
            panelData.clauses.map((clause) => (
              <div
                key={clause.clause_id}
                className="rounded-lg border border-areia/30 bg-branco p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="default">{clause.clause_type}</Badge>
                    <span className="text-xs text-verde/50">v.{clause.verse}</span>
                    {clause.is_mainline && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-telha/10 text-telha font-medium">
                        mainline
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-verde/50">#{clause.clause_id}</span>
                </div>
                <p
                  className="text-lg font-serif leading-relaxed mb-2"
                  dir="rtl"
                  lang="he"
                >
                  {clause.text}
                </p>
                <p className="text-sm text-verde/70 mb-2">{clause.gloss}</p>
                {(clause.subjects.length > 0 || clause.objects.length > 0) && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {clause.subjects.map((s) => (
                      <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-azul/10 text-azul">
                        Subj: {s}
                      </span>
                    ))}
                    {clause.objects.map((o) => (
                      <span key={o} className="text-[10px] px-2 py-0.5 rounded-full bg-verde-claro/10 text-verde-claro">
                        Obj: {o}
                      </span>
                    ))}
                  </div>
                )}
                {clause.names.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {clause.names.map((name) => (
                      <span key={name} className="text-[10px] px-2 py-0.5 rounded-full bg-areia/30 text-preto">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
