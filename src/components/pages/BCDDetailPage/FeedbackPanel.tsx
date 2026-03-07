import { useEffect, useState } from "react";
import { Check, MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";
import { bookContextAPI } from "../../../services/api";
import { useBCDStore } from "../../../stores/bcdStore";
import { Button } from "../../ui/button";

interface FeedbackPanelProps {
  bcdId: string;
  sectionKey: string;
  canManage: boolean;
}

export function FeedbackPanel({ bcdId, sectionKey, canManage }: FeedbackPanelProps) {
  const { feedback, fetchFeedback } = useBCDStore();
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchFeedback(bcdId);
  }, [bcdId, fetchFeedback]);

  const sectionFeedback = feedback.filter((f) => f.section_key === sectionKey);
  const unresolvedCount = sectionFeedback.filter((f) => !f.resolved).length;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await bookContextAPI.addFeedback(bcdId, { section_key: sectionKey, content: content.trim() });
      setContent("");
      await fetchFeedback(bcdId);
      toast.success("Note added.");
    } catch {
      toast.error("Failed to add note.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolve = async (feedbackId: string) => {
    try {
      await bookContextAPI.resolveFeedback(bcdId, feedbackId);
      await fetchFeedback(bcdId);
    } catch {
      toast.error("Failed to resolve.");
    }
  };

  return (
    <div className="mt-4 rounded-xl border border-areia/20 bg-surface p-4">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="h-3.5 w-3.5 text-verde/40" />
        <p className="text-xs font-semibold text-verde/50 uppercase tracking-wide">Notes</p>
        {unresolvedCount > 0 && (
          <span className="text-[10px] font-medium text-telha bg-telha/10 rounded-full px-2 py-0.5">
            {unresolvedCount}
          </span>
        )}
      </div>

      {sectionFeedback.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {sectionFeedback.map((fb) => (
            <div
              key={fb.id}
              className={`flex items-start gap-2 text-xs rounded-lg px-3 py-2 ${
                fb.resolved
                  ? "text-verde/40 bg-verde-claro/5"
                  : "text-preto bg-areia/10"
              }`}
            >
              <p className={`flex-1 ${fb.resolved ? "line-through" : ""}`}>{fb.content}</p>
              {!fb.resolved && canManage && (
                <button
                  onClick={() => handleResolve(fb.id)}
                  className="p-0.5 text-verde-claro hover:text-verde-claro/80 transition-colors flex-shrink-0"
                  title="Mark as resolved"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {canManage && (
        <div className="flex gap-2">
          <input
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a note about this section..."
            className="flex-1 rounded-lg border border-areia/30 bg-surface-alt px-3 py-2 text-xs focus:ring-1 focus:ring-telha focus:border-telha"
            onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            className="h-8 px-3 gap-1.5"
          >
            <Send className="h-3 w-3" />
            Send
          </Button>
        </div>
      )}

      {sectionFeedback.length === 0 && !canManage && (
        <p className="text-xs text-verde/30 italic">No notes yet.</p>
      )}
    </div>
  );
}
