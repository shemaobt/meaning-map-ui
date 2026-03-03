import { useEffect, useState } from "react";
import type { MeaningMapFeedback } from "../../../../types/meaningMap";
import { meaningMapsAPI } from "../../../../services/api";
import { Button } from "../../../ui/button";
import { Textarea } from "../../../ui/textarea";
import { Check, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../../utils/cn";

interface FeedbackThreadProps {
  mapId: string;
  sectionKey: string;
  canWrite: boolean;
  canResolve: boolean;
}

export function FeedbackThread({ mapId, sectionKey, canWrite, canResolve }: FeedbackThreadProps) {
  const [items, setItems] = useState<MeaningMapFeedback[]>([]);
  const [newContent, setNewContent] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    meaningMapsAPI
      .listFeedback(mapId)
      .then((all) => setItems(all.filter((fb) => fb.section_key === sectionKey)))
      .catch(() => { });
  }, [mapId, sectionKey]);

  const handleSubmit = async () => {
    if (!newContent.trim()) return;
    setLoading(true);
    try {
      const fb = await meaningMapsAPI.addFeedback(mapId, {
        section_key: sectionKey,
        content: newContent.trim(),
      });
      setItems((prev) => [...prev, fb]);
      setNewContent("");
    } catch {
      toast.error("Failed to add feedback.");
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (feedbackId: string) => {
    try {
      const updated = await meaningMapsAPI.resolveFeedback(mapId, feedbackId);
      setItems((prev) => prev.map((fb) => (fb.id === feedbackId ? updated : fb)));
    } catch {
      toast.error("Failed to resolve feedback.");
    }
  };

  if (items.length === 0 && !canWrite) return null;

  return (
    <div className="mt-3 rounded-lg border border-azul/20 bg-azul/5 p-3 space-y-2">
      <div className="flex items-center gap-1 text-xs font-medium text-azul">
        <MessageSquare className="h-3 w-3" /> Feedback
      </div>
      {items.map((fb) => (
        <div
          key={fb.id}
          className={cn(
            "text-xs p-2 rounded",
            fb.resolved ? "bg-verde-claro/10 line-through opacity-60" : "bg-white"
          )}
        >
          <div className="flex justify-between">
            <span className="font-medium">{fb.author_name || "Reviewer"}</span>
            {canResolve && !fb.resolved && (
              <Button size="sm" variant="ghost" onClick={() => handleResolve(fb.id)}>
                <Check className="h-3 w-3" />
              </Button>
            )}
          </div>
          <p className="mt-1">{fb.content}</p>
        </div>
      ))}
      {canWrite && (
        <div className="flex flex-col sm:flex-row gap-2">
          <Textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={2}
            className="text-xs flex-1"
            placeholder="Add feedback..."
          />
          <Button size="sm" onClick={handleSubmit} disabled={loading} className="self-end sm:self-start">
            Send
          </Button>
        </div>
      )}
    </div>
  );
}
