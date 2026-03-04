import { AlertTriangle } from "lucide-react";
import type { ValidationWarning } from "../../../../types/meaningMap";
import { cn } from "../../../../utils/cn";

interface WarningsBlockProps {
  warnings: ValidationWarning[];
}

export function WarningsBlock({ warnings }: WarningsBlockProps) {
  if (warnings.length === 0) return null;

  return (
    <div className="space-y-1">
      {warnings.map((w, i) => (
        <div
          key={i}
          className={cn(
            "flex items-start gap-2 rounded px-3 py-2 text-xs",
            w.severity === "error"
              ? "bg-telha/8 text-telha border border-telha/20"
              : "bg-areia/30 text-verde border border-areia"
          )}
        >
          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
          <span>{w.message}</span>
        </div>
      ))}
    </div>
  );
}
