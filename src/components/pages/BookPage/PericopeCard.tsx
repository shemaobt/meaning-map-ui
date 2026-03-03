import { useNavigate } from "react-router-dom";
import type { PericopeWithStatus } from "../../../types/bible";
import { StatusBadge } from "../../common/StatusBadge";
import { LockBadge } from "../../common/LockBadge";
import { Button } from "../../ui/button";
import { useAuth } from "../../../contexts/AuthContext";
import { meaningMapsAPI } from "../../../services/api";
import { toast } from "sonner";

interface PericopeCardProps {
    pericope: PericopeWithStatus;
    onRefresh: () => void;
}

export function PericopeCard({ pericope }: PericopeCardProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isLockedByOther = pericope.locked_by !== null && pericope.locked_by !== user?.id;
    const hasMap = pericope.meaning_map_id !== null;

    const handleLockAndWork = async () => {
        if (!pericope.meaning_map_id) return;
        try {
            await meaningMapsAPI.lock(pericope.meaning_map_id);
            navigate(`/app/maps/${pericope.meaning_map_id}`);
        } catch {
            toast.error("Could not lock this pericope.");
        }
    };

    const handleOpen = () => {
        if (pericope.meaning_map_id) {
            navigate(`/app/maps/${pericope.meaning_map_id}`);
        }
    };

    const handleGenerate = async () => {
        try {
            const mm = await meaningMapsAPI.generate({
                pericope_id: pericope.id,
            });
            navigate(`/app/maps/${mm.id}`);
        } catch {
            toast.error("Could not generate meaning map.");
        }
    };

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-areia/30 bg-white p-3 sm:p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-preto">{pericope.reference}</h4>
                    {pericope.title && (
                        <p className="text-xs text-verde/70 mt-0.5 truncate">{pericope.title}</p>
                    )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={pericope.status} />
                    <LockBadge lockedBy={pericope.locked_by} lockedByName={pericope.locked_by_name} />
                </div>
            </div>

            {pericope.analyst_name && (
                <p className="text-xs text-verde/60">Analyst: {pericope.analyst_name}</p>
            )}

            <div className="flex flex-wrap gap-2 mt-auto">
                {!hasMap && (
                    <Button size="sm" onClick={handleGenerate}>
                        Generate
                    </Button>
                )}
                {hasMap && !isLockedByOther && pericope.status !== "approved" && (
                    <Button size="sm" onClick={handleLockAndWork}>
                        Lock & Work
                    </Button>
                )}
                {hasMap && (
                    <Button size="sm" variant="outline" onClick={handleOpen}>
                        Open
                    </Button>
                )}
            </div>
        </div>
    );
}
