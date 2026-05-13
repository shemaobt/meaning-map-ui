import { useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, X } from "lucide-react";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { Button } from "../../../ui/button";
import { cn } from "../../../../utils/cn";
import { formatBibleRef, type VerseRef } from "../../../../utils/bibleRef";

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

export function VerseRefBadge({ verse }: { verse: VerseRef | null | undefined }) {
  if (!verse) return <span className="text-verde/30 italic text-xs">none</span>;
  return (
    <span className="inline-flex items-center text-xs font-mono px-2 py-0.5 rounded-md bg-areia/15 text-verde/60 border border-areia/20">
      {formatBibleRef(verse)}
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

  // Defence in depth: even if a caller accidentally passes an array containing
  // a non-primitive (previously rendered as the literal "[object Object]"
  // string), never surface it. Primitive coerce survives numbers; objects are
  // dropped entirely.
  const safeTags = tags.filter(
    (t) =>
      typeof t === "string" &&
      t.length > 0 &&
      t !== "[object Object]",
  );

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !safeTags.includes(trimmed)) {
      onChange([...safeTags, trimmed]);
    }
    setInput("");
  };

  const removeTag = (index: number) => {
    onChange(safeTags.filter((_, i) => i !== index));
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
      {safeTags.map((tag, i) => (
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
        placeholder={safeTags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[100px] text-sm bg-transparent outline-none text-preto placeholder:text-areia"
      />
    </div>
  );
}

interface VerseRefInputProps {
  verse: { chapter?: number; verse?: number } | null | undefined;
  onChange: (verse: { chapter: number; verse: number }) => void;
}

export function VerseRefInput({ verse, onChange }: VerseRefInputProps) {
  const ch = verse?.chapter ?? 1;
  const vs = verse?.verse ?? 1;

  return (
    <div className="flex items-center gap-1">
      <Input
        type="number"
        min={1}
        value={ch}
        onChange={(e) => onChange({ chapter: Number(e.target.value) || 1, verse: vs })}
        className="h-9 w-16 text-center font-mono text-xs"
      />
      <span className="text-verde/40 font-mono">:</span>
      <Input
        type="number"
        min={1}
        value={vs}
        onChange={(e) => onChange({ chapter: ch, verse: Number(e.target.value) || 1 })}
        className="h-9 w-16 text-center font-mono text-xs"
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

interface VerseRefListFieldProps {
  label: string;
  verses: { chapter?: number; verse?: number }[];
  onChange: (verses: { chapter: number; verse: number }[]) => void;
  addLabel: string;
}

export function VerseRefListField({
  label,
  verses,
  onChange,
  addLabel,
}: VerseRefListFieldProps) {
  return (
    <FieldGroup label={label}>
      <div className="space-y-1.5">
        {verses.map((v, vi) => (
          <div key={vi} className="flex items-center gap-2">
            <VerseRefInput
              verse={v}
              onChange={(val) => {
                const updated = [...verses] as { chapter: number; verse: number }[];
                updated[vi] = val;
                onChange(updated);
              }}
            />
            <button
              type="button"
              onClick={() =>
                onChange(
                  verses.filter((_, j) => j !== vi) as { chapter: number; verse: number }[],
                )
              }
              className="text-verde/30 hover:text-red-500 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() =>
          onChange([...verses, { chapter: 1, verse: 1 }] as { chapter: number; verse: number }[])
        }
        className="gap-1 h-7 text-xs mt-2"
      >
        <Plus className="h-3 w-3" /> {addLabel}
      </Button>
    </FieldGroup>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function CheckboxField({ label, checked, onChange, description }: CheckboxFieldProps) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-areia accent-telha focus:ring-telha"
      />
      <span className="flex-1">
        <span className="block text-[11px] font-semibold uppercase tracking-wide text-verde/50 group-hover:text-verde/70">
          {label}
        </span>
        {description && (
          <span className="block text-xs text-verde/50 mt-0.5">{description}</span>
        )}
      </span>
    </label>
  );
}

export function ReadOnlyJsonValue({ value }: { value: unknown }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-md border border-areia/30 bg-areia/5 px-3 py-2">
      <div className="flex items-center gap-2 mb-1 text-[9px] font-medium uppercase tracking-wide text-verde/40">
        <span className="px-1.5 py-0.5 rounded bg-areia/20">{t("editors.readOnly")}</span>
        <span className="normal-case tracking-normal text-[10px] text-verde/50">
          {t("editors.complexDataHint")}
        </span>
      </div>
      <pre className="text-xs text-preto/70 font-mono whitespace-pre-wrap overflow-x-auto max-h-48">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

interface DynamicFieldProps {
  value: unknown;
  onChange: (next: unknown) => void;
}

export function DynamicField({ value, onChange }: DynamicFieldProps) {
  if (value === null || value === undefined) {
    return (
      <EditableInput
        value=""
        onChange={(v) => onChange(v)}
      />
    );
  }
  if (typeof value === "string") {
    return (
      <EditableTextarea
        value={value}
        onChange={(v) => onChange(v)}
        rows={2}
      />
    );
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return (
      <EditableInput
        value={String(value)}
        onChange={(v) => onChange(v)}
      />
    );
  }
  if (Array.isArray(value)) {
    const allPrimitives = value.every(
      (v) =>
        typeof v === "string" || typeof v === "number" || typeof v === "boolean",
    );
    if (allPrimitives) {
      return (
        <TagsInput
          tags={value.map((v) => String(v))}
          onChange={(tags) => onChange(tags)}
        />
      );
    }
    return <ReadOnlyJsonValue value={value} />;
  }
  return <ReadOnlyJsonValue value={value} />;
}

interface OtherKeysSectionProps {
  data: Record<string, unknown>;
  knownKeys: Set<string>;
  onUpdate: (key: string, value: unknown) => void;
}

export function OtherKeysSection({ data, knownKeys, onUpdate }: OtherKeysSectionProps) {
  const otherKeys = Object.keys(data).filter((k) => !knownKeys.has(k));
  if (otherKeys.length === 0) return null;

  return (
    <>
      {otherKeys.map((key) => (
        <FieldGroup key={key} label={key.replace(/_/g, " ")}>
          <DynamicField value={data[key]} onChange={(next) => onUpdate(key, next)} />
        </FieldGroup>
      ))}
    </>
  );
}
