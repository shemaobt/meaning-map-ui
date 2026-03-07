import { useEffect, useRef, useState } from "react";
import { CheckCircle, Circle, Loader2, Square, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { useBCDStore } from "../../../stores/bcdStore";
import { bookContextAPI } from "../../../services/api";
import { ConfirmDialog } from "../../common/ConfirmDialog";
import { Button } from "../../ui/button";
import { cn } from "../../../utils/cn";

const TOTAL_STEPS = 5;

const STEP_LABELS: Record<string, string> = {
  collect_bhsa: "Collect BHSA data",
  structural_outline: "Structural outline",
  participants: "Participant register",
  discourse: "Discourse threads",
  context_sections: "Context sections",
};

interface GenerationPanelProps {
  bcdId: string;
  canManage: boolean;
}

export function GenerationPanel({ bcdId, canManage }: GenerationPanelProps) {
  const { generationLogs, isPolling, fetchLogs, startPolling, stopPolling } = useBCDStore();
  const currentBCD = useBCDStore((s) => s.currentBCD);
  const navigate = useNavigate();
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    fetchLogs(bcdId);
    if (currentBCD?.status === "generating") {
      startPolling(bcdId);
    }
    return () => stopPolling();
  }, [bcdId, currentBCD?.status, fetchLogs, startPolling, stopPolling]);

  const isGenerating = currentBCD?.status === "generating";

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      stopPolling();
      const result = await bookContextAPI.cancelGeneration(bcdId);
      toast.success("Generation cancelled. Version deleted.");
      navigate(`/app/books/${result.book_id}`);
    } catch (e) {
      const msg = e instanceof AxiosError ? e.response?.data?.detail : "Failed to cancel generation.";
      toast.error(msg);
      setIsCancelling(false);
    }
  };

  if (generationLogs.length === 0 && !isPolling) return null;

  const sorted = [...generationLogs].sort((a, b) => a.step_order - b.step_order);
  const completedCount = sorted.filter((l) => l.status === "completed").length;
  const progress = (completedCount / TOTAL_STEPS) * 100;
  const hasFailed = sorted.some((l) => l.status === "failed");
  const allDone = completedCount >= TOTAL_STEPS || (sorted.length > 0 && sorted.every((l) => l.status === "completed" || l.status === "failed"));

  if (allDone && !isGenerating && !hasFailed) return null;

  return (
    <>
      <div className="rounded-lg border border-areia/20 bg-surface-alt p-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-verde/60 flex items-center gap-2">
            {isPolling && <Loader2 className="h-3.5 w-3.5 animate-spin text-telha" />}
            Generation
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-verde/40 tabular-nums">
              {completedCount}/{TOTAL_STEPS} steps
            </span>
            {isGenerating && canManage && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowStopDialog(true)}
                disabled={isCancelling}
                className="h-6 px-2 text-[10px] gap-1 text-red-600 border-red-200 hover:bg-red-600/10 hover:border-red-300"
              >
                <Square className="h-2.5 w-2.5 fill-current" />
                {isCancelling ? "Stopping..." : "Stop"}
              </Button>
            )}
          </div>
        </div>

        <div className="w-full h-1.5 bg-areia/20 rounded-full mb-4 overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500 ease-out",
              hasFailed ? "bg-red-400" : "bg-telha",
            )}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
          {sorted.map((log) => (
            <StepRow key={log.id} log={log} />
          ))}
        </div>

        {hasFailed && (
          <p className="mt-3 text-xs text-red-600 bg-red-600/10 rounded-md px-3 py-2">
            {sorted.find((l) => l.status === "failed")?.error_detail}
          </p>
        )}
      </div>

      <ConfirmDialog
        open={showStopDialog}
        onOpenChange={setShowStopDialog}
        title="Stop generation?"
        description="This will cancel the current generation and delete this version entirely. This action cannot be undone."
        confirmLabel="Stop & Delete"
        variant="destructive"
        onConfirm={handleCancel}
      />
    </>
  );
}

function StepRow({ log }: { log: { id: string; step_name: string; status: string; duration_ms: number | null; started_at: string | null } }) {
  const elapsed = useElapsed(log.status === "running" ? log.started_at : null);

  return (
    <div className="flex items-center gap-2 text-xs">
      <StepIcon status={log.status} />
      <span
        className={cn(
          "flex-1 truncate",
          log.status === "completed" && "text-verde-claro",
          log.status === "failed" && "text-red-600",
          log.status === "running" && "text-preto font-medium",
          log.status === "pending" && "text-verde/30",
        )}
      >
        {STEP_LABELS[log.step_name] || log.step_name}
      </span>
      {log.status === "running" && elapsed !== null && (
        <span className="text-telha/60 tabular-nums flex-shrink-0">
          {elapsed.toFixed(0)}s
        </span>
      )}
      {log.status === "completed" && log.duration_ms != null && (
        <span className="text-verde/25 tabular-nums flex-shrink-0">
          {(log.duration_ms / 1000).toFixed(1)}s
        </span>
      )}
    </div>
  );
}

function useElapsed(startedAt: string | null): number | null {
  const [elapsed, setElapsed] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(null);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed((Date.now() - start) / 1000);
    tick();
    intervalRef.current = setInterval(tick, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [startedAt]);

  return elapsed;
}

function StepIcon({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <CheckCircle className="h-3.5 w-3.5 text-verde-claro flex-shrink-0" />;
    case "running":
      return <Loader2 className="h-3.5 w-3.5 animate-spin text-telha flex-shrink-0" />;
    case "failed":
      return <XCircle className="h-3.5 w-3.5 text-red-600 flex-shrink-0" />;
    default:
      return <Circle className="h-3.5 w-3.5 text-verde/15 flex-shrink-0" />;
  }
}
