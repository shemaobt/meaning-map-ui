import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { cn } from "../../../../utils/cn";

interface FieldGroupProps {
  label: string;
  readOnly?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FieldGroup({ label, readOnly, children, className }: FieldGroupProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-verde/50">
        {label}
        {readOnly && (
          <span className="text-[9px] font-medium normal-case tracking-normal px-1.5 py-0.5 rounded bg-areia/20 text-verde/40">
            BHSA
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export function ReadOnlyValue({ value }: { value: string }) {
  return (
    <p className="text-sm text-preto/70 bg-areia/10 rounded-md px-3 py-2 border border-areia/15">
      {value || <span className="italic text-verde/30">empty</span>}
    </p>
  );
}

export function VerseRefBadge({ verse }: { verse: { chapter?: number; verse?: number } | null | undefined }) {
  if (!verse) return <span className="text-verde/30 italic text-xs">none</span>;
  return (
    <span className="inline-flex items-center text-xs font-mono px-2 py-0.5 rounded-md bg-areia/15 text-verde/60 border border-areia/20">
      {verse.chapter ?? "?"}:{verse.verse ?? "?"}
    </span>
  );
}

interface TagsInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagsInput({ tags, onChange, placeholder = "Type and press Enter" }: TagsInputProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-areia bg-surface px-2 py-1.5 min-h-[40px] focus-within:ring-2 focus-within:ring-telha focus-within:border-telha">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-azul/10 text-azul border border-azul/20"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            className="hover:text-telha transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[100px] text-sm bg-transparent outline-none text-preto placeholder:text-areia"
      />
    </div>
  );
}

interface EditableInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
}

export function EditableInput({ value, onChange, placeholder, className }: EditableInputProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={cn("h-9", className)}
    />
  );
}

interface EditableTextareaProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}

export function EditableTextarea({ value, onChange, placeholder, rows = 3 }: EditableTextareaProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="resize-y"
    />
  );
}
