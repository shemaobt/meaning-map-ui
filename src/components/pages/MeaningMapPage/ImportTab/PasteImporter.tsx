import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import { parseMap } from "../../../../utils/parser";
import { useMeaningMapStore } from "../../../../stores/meaningMapStore";
import { meaningMapsAPI } from "../../../../services/api";
import { toast } from "sonner";

interface PasteImporterProps {
  mapId: string;
}

export function PasteImporter({ mapId }: PasteImporterProps) {
  const { t } = useTranslation();
  const [raw, setRaw] = useState("");
  const [loading, setLoading] = useState(false);
  const setFromBackend = useMeaningMapStore((s) => s.setFromBackend);

  const handleImport = async () => {
    if (!raw.trim()) return;
    setLoading(true);
    try {
      const parsed = parseMap(raw);
      const updated = await meaningMapsAPI.update(mapId, parsed);
      setFromBackend(updated);
      toast.success(t("meaningMap.importSuccess"));
      setRaw("");
    } catch {
      toast.error(t("meaningMap.importFailed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-preto">{t("meaningMap.manualImport")}</h4>
      <p className="text-xs text-verde/60">
        {t("meaningMap.manualImportDescription")}
      </p>
      <Textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={t("meaningMap.pasteMarkdownPlaceholder")}
        rows={12}
        className="font-mono text-xs"
      />
      <Button onClick={handleImport} disabled={!raw.trim() || loading} size="sm">
        {loading ? t("common.importing") : t("meaningMap.parseImport")}
      </Button>
    </div>
  );
}
