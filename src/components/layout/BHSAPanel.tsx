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
                  <Badge variant="default">{clause.clause_type}</Badge>
                  <span className="text-xs text-verde/50">#{clause.clause_id}</span>
                </div>
                <p
                  className="text-lg font-serif leading-relaxed mb-3"
                  dir="rtl"
                  lang="he"
                >
                  {clause.text}
                </p>
                {clause.phrases.map((phrase) => (
                  <div key={phrase.phrase_id} className="ml-2 mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="default" className="text-[10px]">
                        {phrase.phrase_type}
                      </Badge>
                      <span className="text-[10px] text-verde/50">{phrase.function}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {phrase.words.map((word) => (
                        <div
                          key={word.word_id}
                          className="rounded bg-white border border-areia/20 px-2 py-1 text-center"
                        >
                          <span className="block text-sm font-serif" dir="rtl" lang="he">
                            {word.text}
                          </span>
                          <span className="block text-[10px] text-verde/70">{word.gloss}</span>
                          <span className="block text-[9px] text-areia">
                            {word.pos} · {word.lemma}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
