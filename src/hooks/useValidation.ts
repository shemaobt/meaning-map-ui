import { useMeaningMapStore } from "../stores/meaningMapStore";

export function useValidation() {
  const warnings = useMeaningMapStore((s) => s.reviewState.warnings);
  const errorCount = warnings.filter((w) => w.severity === "error").length;
  const warningCount = warnings.filter((w) => w.severity === "warning").length;
  const isValid = errorCount === 0;

  return { warnings, errorCount, warningCount, isValid };
}
