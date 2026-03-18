import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { Button } from "../../../ui/button";
import { meaningMapsAPI } from "../../../../services/api";
import { useMeaningMapStore } from "../../../../stores/meaningMapStore";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { GenerationOverlay } from "../../BookPage/GenerationOverlay";

interface GeneratePanelProps {
  pericopeId: string;
}

export function GeneratePanel({ pericopeId }: GeneratePanelProps) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const setFromBackend = useMeaningMapStore((s) => s.setFromBackend);

  const handleGenerate = async () => {
    setLoading(true);
    setGenError(null);
    try {
      const mm = await meaningMapsAPI.generate({
        pericope_id: pericopeId,
      });
      setFromBackend(mm);
      toast.success(t("meaningMap.mapGenerated"));
    } catch (e) {
      const detail =
        e instanceof AxiosError ? e.response?.data?.detail : undefined;
      const msg = detail || t("meaningMap.generationFailed");
      toast.error(msg);
      setGenError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-telha/20 bg-telha/5 p-4 sm:p-6 text-center">
      <Sparkles className="mx-auto h-8 w-8 text-telha mb-3" />
      <h4 className="text-sm font-semibold text-preto">{t("meaningMap.generateWithAI")}</h4>
      <p className="mt-1 text-xs text-verde/70">
        {t("meaningMap.generateDescription")}
      </p>
      {loading || genError ? (
        <div className="mt-4 inline-block text-left">
          <GenerationOverlay isActive={loading} error={genError} />
        </div>
      ) : (
        <Button onClick={handleGenerate} className="mt-4">
          {t("meaningMap.generateButton")}
        </Button>
      )}
    </div>
  );
}
