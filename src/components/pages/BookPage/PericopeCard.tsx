import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { PericopeWithStatus } from "../../../types/bible";
import { StatusBadge } from "../../common/StatusBadge";
import { LockBadge } from "../../common/LockBadge";
import { Button } from "../../ui/button";
import { useAuth } from "../../../contexts/AuthContext";
import { meaningMapsAPI } from "../../../services/api";
import { toast } from "sonner";
import { GenerationOverlay } from "./GenerationOverlay";
import { Eye, ClipboardCheck, Pencil, MessageSquare } from "lucide-react";

interface PericopeCardProps {
    pericope: PericopeWithStatus;
    onRefresh: () => void;
}

export function PericopeCard({ pericope }: PericopeCardProps) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [generating, setGenerating] = useState(false);

    const isLockedByOther = pericope.locked_by !== null && pericope.locked_by !== user?.id;
    const isAnalyst = pericope.analyst_name === user?.display_name;
    const hasMap = pericope.meaning_map_id !== null;
    const status = pericope.status;
    const needsRevision = status === "draft" && pericope.unresolved_feedback_count > 0;

    const handleLockAndWork = async () => {
        if (!pericope.meaning_map_id) return;
        try {
            await meaningMapsAPI.lock(pericope.meaning_map_id);
            toast.success(status === "cross_check" ? "Cross-check started." : "Locked for editing.");
            navigate(`/app/maps/${pericope.meaning_map_id}`);
        } catch {
            toast.error("Could not lock this pericope.");
        }
    };

    const handleView = () => {
        if (pericope.meaning_map_id) {
            navigate(`/app/maps/${pericope.meaning_map_id}`);
        }
    };

    const handleGenerate = async () => {
        setGenerating(true);
        toast.info("Generating meaning map...");
        try {
            const mm = await meaningMapsAPI.generate({
                pericope_id: pericope.id,
            });
            toast.success("Meaning map generated.");
            navigate(`/app/maps/${mm.id}`);
        } catch {
            toast.error("Could not generate meaning map.");
            setGenerating(false);
        }
    };

    const showAnalystLock = hasMap && !isLockedByOther && status === "draft" && isAnalyst;
    const showCrossCheckLock = hasMap && !isLockedByOther && status === "cross_check" && !isAnalyst;
    const showView = hasMap;

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-areia/30 bg-surface p-3 sm:p-4 shadow-sm">
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

            {needsRevision && (
                <div className="flex items-center gap-1.5 text-xs font-medium text-telha">
                    <MessageSquare className="h-3 w-3" />
                    Revisions requested ({pericope.unresolved_feedback_count} feedback)
                </div>
            )}

            <GenerationOverlay isActive={generating} />

            {!generating && (
                <div className="flex flex-wrap gap-2 mt-auto">
                    {!hasMap && (
                        <Button size="sm" onClick={handleGenerate}>
                            Generate
                        </Button>
                    )}
                    {showAnalystLock && (
                        <Button size="sm" onClick={handleLockAndWork} className="gap-1">
                            <Pencil className="h-3 w-3" />
                            {needsRevision ? "Revise & Edit" : "Lock & Edit"}
                        </Button>
                    )}
                    {showCrossCheckLock && (
                        <Button size="sm" onClick={handleLockAndWork} className="gap-1">
                            <ClipboardCheck className="h-3 w-3" /> Start Cross-check
                        </Button>
                    )}
                    {showView && (
                        <Button size="sm" variant="outline" onClick={handleView} className="gap-1">
                            <Eye className="h-3 w-3" /> View
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
