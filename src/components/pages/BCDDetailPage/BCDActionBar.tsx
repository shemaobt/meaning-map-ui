import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { bookContextAPI } from "../../../services/api";
import { useBCDStore } from "../../../stores/bcdStore";
import type { BCDStatus } from "../../../types/bookContext";
import { Button } from "../../ui/button";

interface BCDActionBarProps {
  bcdId: string;
  status: BCDStatus;
  canEdit: boolean;
  canApproveBCD: boolean;
  hasContent: boolean;
  isApproved: boolean;
}

export function BCDActionBar({ bcdId, status, canEdit, canApproveBCD, hasContent, isApproved }: BCDActionBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [showRegenDialog, setShowRegenDialog] = useState(false);
  const [feedback, setFeedback] = useState("");
  const fetchBCD = useBCDStore((s) => s.fetchBCD);
  const startPolling = useBCDStore((s) => s.startPolling);

  const handleGenerate = async (feedbackText?: string) => {
    setLoading("generate");
    setShowRegenDialog(false);
    try {
      const body = feedbackText ? { feedback: feedbackText } : undefined;
      const newBCD = await bookContextAPI.generate(bcdId, body);
      toast.success(t("bcdDetail.generationStarted"));
      if (newBCD.id !== bcdId) {
        navigate(`/app/book-context/${newBCD.id}`);
      }
      startPolling(newBCD.id);
    } catch (e) {
      const msg = e instanceof AxiosError ? e.response?.data?.detail : t("bcdDetail.generationFailed");
      toast.error(msg);
    } finally {
      setLoading(null);
      setFeedback("");
    }
  };

  const handleApprove = async () => {
    setLoading("approve");
    try {
      await bookContextAPI.approve(bcdId);
      await fetchBCD(bcdId);
      toast.success(t("bcdDetail.approveSuccess"));
    } catch (e) {
      const msg = e instanceof AxiosError ? e.response?.data?.detail : t("bcdDetail.approveFailed");
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  };

  const onRegenerateClick = () => {
    if (hasContent) {
      setShowRegenDialog(true);
    } else {
      handleGenerate();
    }
  };

  if (!canEdit && !canApproveBCD) return null;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {canEdit && status !== "generating" && (
          <Button
            size="sm"
            onClick={onRegenerateClick}
            disabled={loading !== null}
            className="gap-1"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {loading === "generate" ? t("common.starting") : hasContent ? t("bcdDetail.regenerate") : t("bcdDetail.generate")}
          </Button>
        )}

        {canApproveBCD && !isApproved && status !== "generating" && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleApprove}
            disabled={loading !== null}
            className="gap-1"
          >
            <Check className="h-3.5 w-3.5" />
            {loading === "approve" ? t("common.approving") : t("common.approve")}
          </Button>
        )}
      </div>

      {showRegenDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-preto/40">
          <div className="relative w-full max-w-md mx-4 rounded-xl bg-surface border border-areia/30 shadow-xl p-6">
            <button
              onClick={() => { setShowRegenDialog(false); setFeedback(""); }}
              className="absolute top-3 right-3 text-verde/40 hover:text-telha transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <h3 className="text-base font-bold text-preto mb-1">{t("bcdDetail.regenerateTitle")}</h3>
            <p className="text-xs text-verde/60 mb-4">
              {t("bcdDetail.regenerateDescription")}
            </p>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={t("bcdDetail.regenerateFeedbackPlaceholder")}
              rows={4}
              maxLength={2000}
              className="w-full rounded-md border border-areia bg-surface px-3 py-2 text-sm focus:ring-2 focus:ring-telha focus:border-telha resize-y"
            />
            <p className="text-[10px] text-verde/40 mt-1 text-right">{feedback.length}/2000</p>

            <div className="flex justify-end gap-2 mt-4">
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setShowRegenDialog(false); setFeedback(""); }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                size="sm"
                onClick={() => handleGenerate(feedback || undefined)}
                disabled={loading !== null}
                className="gap-1"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {t("bcdDetail.regenerateButton")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
