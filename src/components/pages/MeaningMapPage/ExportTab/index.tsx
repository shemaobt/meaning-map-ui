import { useState } from "react";
import { useMeaningMapStore } from "../../../../stores/meaningMapStore";
import { Button } from "../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../ui/card";
import { buildJSON, buildProse } from "../../../../utils/exporter";
import { Copy, Download } from "lucide-react";
import { toast } from "sonner";

export function ExportTab() {
  const currentMap = useMeaningMapStore((s) => s.currentMap);
  const [jsonPreview, setJsonPreview] = useState("");
  const [prosePreview, setProsePreview] = useState("");

  if (!currentMap || currentMap.status !== "approved") {
    return (
      <div className="text-center py-12 text-verde/50">
        <p className="text-sm">Export is only available for approved meaning maps.</p>
      </div>
    );
  }

  const handlePreviewJSON = () => setJsonPreview(buildJSON(currentMap.data));
  const handlePreviewProse = () => setProsePreview(buildProse(currentMap.data));

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard.");
  };

  const handleDownload = (text: string, filename: string, mime: string) => {
    const blob = new Blob([text], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}.`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>JSON Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handlePreviewJSON}>
              Preview
            </Button>
            {jsonPreview && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(jsonPreview)}
                  className="gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDownload(jsonPreview, "meaning-map.json", "application/json")}
                  className="gap-1"
                >
                  <Download className="h-3 w-3" /> Download
                </Button>
              </>
            )}
          </div>
          {jsonPreview && (
            <pre className="max-h-80 overflow-auto rounded border border-areia/30 bg-branco p-3 text-xs font-mono">
              {jsonPreview}
            </pre>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Prose Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={handlePreviewProse}>
              Preview
            </Button>
            {prosePreview && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy(prosePreview)}
                  className="gap-1"
                >
                  <Copy className="h-3 w-3" /> Copy
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    handleDownload(prosePreview, "meaning-map.md", "text/markdown")
                  }
                  className="gap-1"
                >
                  <Download className="h-3 w-3" /> Download
                </Button>
              </>
            )}
          </div>
          {prosePreview && (
            <pre className="max-h-80 overflow-auto rounded border border-areia/30 bg-branco p-3 text-xs font-mono whitespace-pre-wrap">
              {prosePreview}
            </pre>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
