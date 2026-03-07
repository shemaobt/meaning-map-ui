import { useState } from "react";
import { Info, X } from "lucide-react";

export function BCDInfoTooltip() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-verde/40 hover:text-azul transition-colors"
        title="How Book Context works"
      >
        <Info className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-preto/40">
          <div className="relative w-full max-w-md mx-4 rounded-xl bg-surface border border-areia/30 shadow-xl p-6">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 text-verde/40 hover:text-telha transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-base font-bold text-preto mb-4">How Book Context Works</h3>

            <ul className="space-y-3 text-sm text-preto/80">
              <li className="flex gap-2">
                <span className="text-telha font-bold flex-shrink-0">1.</span>
                <span>
                  <strong>Edit sections directly</strong> by clicking on tiles when the document is in draft status.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-telha font-bold flex-shrink-0">2.</span>
                <span>
                  <strong>Regenerate with feedback</strong> to guide the AI — click Regenerate and provide optional instructions.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-telha font-bold flex-shrink-0">3.</span>
                <span>
                  <strong>Approval requires 2+ reviewers</strong> with specialist roles (exegete, biblical language specialist, or translation specialist). An admin can approve instantly.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-telha font-bold flex-shrink-0">4.</span>
                <span>
                  <strong>BHSA static data</strong> (names, verse references, appearance counts) should not be edited manually — these come from the linguistic database.
                </span>
              </li>
            </ul>

            <button
              onClick={() => setOpen(false)}
              className="mt-5 w-full rounded-lg bg-telha text-branco py-2 text-sm font-medium hover:bg-telha/90 transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
