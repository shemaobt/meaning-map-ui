import type { QAPair } from "../../../../../types/meaningMap";
import { Button } from "../../../../ui/button";
import { Input } from "../../../../ui/input";
import { Plus, Trash2 } from "lucide-react";

interface QAEditorProps {
  content: QAPair[];
  onChange: (content: QAPair[]) => void;
  readOnly?: boolean;
}

export function QAEditor({ content, onChange, readOnly = false }: QAEditorProps) {
  const updateQA = (i: number, field: "question" | "answer", value: string) => {
    const updated = [...content];
    updated[i] = { ...updated[i], [field]: value };
    onChange(updated);
  };

  const addQA = () => {
    onChange([...content, { question: "", answer: "" }]);
  };

  const removeQA = (i: number) => {
    onChange(content.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-2">
      {content.map((qa, i) => (
        <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-start">
          <div className="flex-1 space-y-1">
            <Input
              value={qa.question}
              onChange={(e) => updateQA(i, "question", e.target.value)}
              readOnly={readOnly}
              placeholder="Question?"
              className="text-xs h-8 font-medium"
            />
            <Input
              value={qa.answer}
              onChange={(e) => updateQA(i, "answer", e.target.value)}
              readOnly={readOnly}
              placeholder="Answer"
              className="text-xs h-8"
            />
          </div>
          {!readOnly && (
            <Button size="sm" variant="ghost" onClick={() => removeQA(i)} className="mt-1">
              <Trash2 className="h-3 w-3 text-telha" />
            </Button>
          )}
        </div>
      ))}
      {!readOnly && (
        <Button size="sm" variant="outline" onClick={addQA} className="gap-1">
          <Plus className="h-3 w-3" /> Add Q&A
        </Button>
      )}
    </div>
  );
}
