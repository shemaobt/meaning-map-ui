import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { meaningMapsAPI } from "../../../services/api";
import { useMeaningMapStore } from "../../../stores/meaningMapStore";
import { useAuth } from "../../../contexts/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../ui/tabs";
import { StatusBadge } from "../../common/StatusBadge";
import { LockBadge } from "../../common/LockBadge";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { ImportTab } from "./ImportTab";
import { ReviewTab } from "./ReviewTab";
import { ExportTab } from "./ExportTab";
import { ChevronRight } from "lucide-react";
import type { MeaningMapStatus } from "../../../types/bible";

export function MeaningMapPage() {
  const { mapId } = useParams<{ mapId: string }>();
  const { user } = useAuth();
  const { currentMap, setFromBackend, clear } = useMeaningMapStore();
  const [loading, setLoading] = useState(true);

  const fetchMap = useCallback(async () => {
    if (!mapId) return;
    try {
      const mm = await meaningMapsAPI.get(mapId);
      setFromBackend(mm);
    } finally {
      setLoading(false);
    }
  }, [mapId, setFromBackend]);

  useEffect(() => {
    fetchMap();
    return () => clear();
  }, [fetchMap, clear]);

  if (loading) return <LoadingSpinner />;
  if (!currentMap) {
    return (
      <div className="text-center py-12 text-verde/50">
        <p className="text-sm">Meaning map not found.</p>
        <Link to="/app/dashboard" className="text-telha text-sm hover:underline mt-2 inline-block">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const isLockedByOther = currentMap.locked_by !== null && currentMap.locked_by !== user?.id;
  const readOnly = isLockedByOther || currentMap.status === "approved";

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm text-verde/70 mb-4">
        <Link to="/app/dashboard" className="hover:text-telha">
          Dashboard
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="font-medium text-preto">Meaning Map</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-preto">Meaning Map</h2>
        <div className="flex items-center gap-2">
          <StatusBadge status={currentMap.status as MeaningMapStatus} />
          <LockBadge lockedBy={currentMap.locked_by} lockedByName={null} />
        </div>
      </div>

      <Tabs defaultValue="review">
        <TabsList>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="review">Review</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <ImportTab
            mapId={currentMap.id}
            pericopeId={currentMap.pericope_id}
          />
        </TabsContent>

        <TabsContent value="review">
          <ReviewTab readOnly={readOnly} onRefresh={fetchMap} />
        </TabsContent>

        <TabsContent value="export">
          <ExportTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
