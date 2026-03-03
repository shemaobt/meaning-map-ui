import { GeneratePanel } from "./GeneratePanel";
import { PasteImporter } from "./PasteImporter";

interface ImportTabProps {
  mapId: string;
  pericopeId: string;
}

export function ImportTab({ mapId, pericopeId }: ImportTabProps) {
  return (
    <div className="space-y-6">
      <GeneratePanel pericopeId={pericopeId} />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-areia/30" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-branco px-2 text-verde/50">or import manually</span>
        </div>
      </div>
      <PasteImporter mapId={mapId} />
    </div>
  );
}
