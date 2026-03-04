import { useState } from "react";
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
      toast.success("Map imported and saved.");
      setRaw("");
    } catch {
      toast.error("Failed to import map.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-preto">Manual Import</h4>
      <p className="text-xs text-verde/60">
        Paste raw meaning map markdown from NotebookLM or another source.
      </p>
      <Textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder="Paste markdown here..."
        rows={12}
        className="font-mono text-xs"
      />
      <Button onClick={handleImport} disabled={!raw.trim() || loading} size="sm">
        {loading ? "Importing..." : "Parse & Import"}
      </Button>
    </div>
  );
}
