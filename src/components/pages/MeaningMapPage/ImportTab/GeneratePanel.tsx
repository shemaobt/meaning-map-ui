import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "../../../ui/button";
import { meaningMapsAPI } from "../../../../services/api";
import { useMeaningMapStore } from "../../../../stores/meaningMapStore";
import { toast } from "sonner";

interface GeneratePanelProps {
  pericopeId: string;
}

export function GeneratePanel({ pericopeId }: GeneratePanelProps) {
  const [loading, setLoading] = useState(false);
  const setFromBackend = useMeaningMapStore((s) => s.setFromBackend);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const mm = await meaningMapsAPI.generate({
        pericope_id: pericopeId,
      });
      setFromBackend(mm);
      toast.success("Map generated successfully.");
    } catch {
      toast.error("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-telha/20 bg-telha/5 p-4 sm:p-6 text-center">
      <Sparkles className="mx-auto h-8 w-8 text-telha mb-3" />
      <h4 className="text-sm font-semibold text-preto">Generate with AI</h4>
      <p className="mt-1 text-xs text-verde/70">
        Uses BHSA Hebrew data + RAG methodology context to produce a draft meaning map.
      </p>
      <Button onClick={handleGenerate} disabled={loading} className="mt-4">
        {loading ? "Generating..." : "Generate Meaning Map"}
      </Button>
    </div>
  );
}
