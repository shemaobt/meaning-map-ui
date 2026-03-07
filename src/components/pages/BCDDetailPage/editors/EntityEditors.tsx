import { useState } from "react";
import { ChevronDown, ChevronRight, MapPin, Package, Building2, Plus, Trash2 } from "lucide-react";
import {
  FieldGroup,
  ReadOnlyValue,
  VerseRefBadge,
  EditableInput,
  EditableTextarea,
} from "./FieldPrimitives";
import { Button } from "../../../ui/button";

type VerseRef = { chapter?: number; verse?: number };

// ─── Places ─────────────────────────────────────────────────────────────────

type Place = {
  name?: string;
  english_gloss?: string;
  first_appears?: VerseRef;
  type?: string;
  meaning_and_function?: string;
  appears_in?: VerseRef[];
  [k: string]: unknown;
};

export function PlaceEditor({ data, setData }: { data: unknown; setData: (val: unknown) => void }) {
  const items = Array.isArray(data) ? (data as Place[]) : [];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const updateItem = (index: number, field: string, value: unknown) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setData(updated);
  };

  const addItem = () => {
    setData([...items, { name: "", first_appears: { chapter: 1, verse: 1 }, type: "", meaning_and_function: "" }]);
    setOpenIdx(items.length);
  };

  const removeItem = (index: number) => {
    setData(items.filter((_, i) => i !== index));
    setOpenIdx(null);
  };

  return (
    <div className="space-y-2">
      {items.map((pl, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className="rounded-lg border border-areia/20 overflow-hidden bg-surface">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-surface-alt transition-colors"
            >
              <MapPin className="h-4 w-4 text-azul/50 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-preto">{pl.name || `Place ${i + 1}`}</span>
                {pl.type && <span className="text-xs text-verde/40 ml-2">{pl.type}</span>}
              </div>
              <VerseRefBadge verse={pl.first_appears} />
              {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-verde/30" /> : <ChevronRight className="h-3.5 w-3.5 text-verde/30" />}
            </button>
            {isOpen && (
              <div className="border-t border-areia/15 px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="Name" readOnly>
                    <ReadOnlyValue value={pl.name ?? ""} />
                  </FieldGroup>
                  <FieldGroup label="English Gloss">
                    <EditableInput
                      value={pl.english_gloss ?? ""}
                      onChange={(val) => updateItem(i, "english_gloss", val)}
                      placeholder="English meaning"
                    />
                  </FieldGroup>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="First Appears" readOnly>
                    <div className="flex items-center h-9">
                      <VerseRefBadge verse={pl.first_appears} />
                    </div>
                  </FieldGroup>
                  <FieldGroup label="Type">
                    <EditableInput
                      value={pl.type ?? ""}
                      onChange={(val) => updateItem(i, "type", val)}
                      placeholder="e.g. city, region, location"
                    />
                  </FieldGroup>
                </div>
                <FieldGroup label="Meaning and Function">
                  <EditableTextarea
                    value={pl.meaning_and_function ?? ""}
                    onChange={(val) => updateItem(i, "meaning_and_function", val)}
                    placeholder="Describe the significance and role of this place..."
                    rows={2}
                  />
                </FieldGroup>
                {Array.isArray(pl.appears_in) && pl.appears_in.length > 0 && (
                  <FieldGroup label="Also Appears In" readOnly>
                    <div className="flex flex-wrap gap-1.5">
                      {pl.appears_in.map((v, vi) => (
                        <VerseRefBadge key={vi} verse={v} />
                      ))}
                    </div>
                  </FieldGroup>
                )}
                <div className="flex justify-end pt-2 border-t border-areia/10">
                  <Button type="button" size="sm" variant="outline" onClick={() => removeItem(i)} className="gap-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="h-3 w-3" /> Remove Place
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Button type="button" variant="outline" onClick={addItem} className="w-full gap-1.5 h-10 border-dashed border-areia/40 text-verde/50 hover:text-telha hover:border-telha/30">
        <Plus className="h-4 w-4" /> Add Place
      </Button>
    </div>
  );
}

// ─── Objects ─────────────────────────────────────────────────────────────────

type Obj = {
  name?: string;
  first_appears?: VerseRef;
  what_it_is?: string;
  meaning_across_scenes?: string;
  appears_in?: VerseRef[];
  [k: string]: unknown;
};

export function ObjectEditor({ data, setData }: { data: unknown; setData: (val: unknown) => void }) {
  const items = Array.isArray(data) ? (data as Obj[]) : [];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const updateItem = (index: number, field: string, value: unknown) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setData(updated);
  };

  const addItem = () => {
    setData([...items, { name: "", first_appears: { chapter: 1, verse: 1 }, what_it_is: "", meaning_across_scenes: "" }]);
    setOpenIdx(items.length);
  };

  const removeItem = (index: number) => {
    setData(items.filter((_, i) => i !== index));
    setOpenIdx(null);
  };

  return (
    <div className="space-y-2">
      {items.map((obj, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className="rounded-lg border border-areia/20 overflow-hidden bg-surface">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-surface-alt transition-colors"
            >
              <Package className="h-4 w-4 text-verde/40 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium text-preto">{obj.name || `Object ${i + 1}`}</span>
              <VerseRefBadge verse={obj.first_appears} />
              {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-verde/30" /> : <ChevronRight className="h-3.5 w-3.5 text-verde/30" />}
            </button>
            {isOpen && (
              <div className="border-t border-areia/15 px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="Name" readOnly>
                    <ReadOnlyValue value={obj.name ?? ""} />
                  </FieldGroup>
                  <FieldGroup label="First Appears" readOnly>
                    <div className="flex items-center h-9">
                      <VerseRefBadge verse={obj.first_appears} />
                    </div>
                  </FieldGroup>
                </div>
                <FieldGroup label="What It Is">
                  <EditableTextarea
                    value={obj.what_it_is ?? ""}
                    onChange={(val) => updateItem(i, "what_it_is", val)}
                    placeholder="Describe what this object is..."
                    rows={2}
                  />
                </FieldGroup>
                <FieldGroup label="Meaning Across Scenes">
                  <EditableTextarea
                    value={obj.meaning_across_scenes ?? ""}
                    onChange={(val) => updateItem(i, "meaning_across_scenes", val)}
                    placeholder="How its meaning evolves across the book..."
                    rows={2}
                  />
                </FieldGroup>
                {Array.isArray(obj.appears_in) && obj.appears_in.length > 0 && (
                  <FieldGroup label="Also Appears In" readOnly>
                    <div className="flex flex-wrap gap-1.5">
                      {obj.appears_in.map((v, vi) => (
                        <VerseRefBadge key={vi} verse={v} />
                      ))}
                    </div>
                  </FieldGroup>
                )}
                <div className="flex justify-end pt-2 border-t border-areia/10">
                  <Button type="button" size="sm" variant="outline" onClick={() => removeItem(i)} className="gap-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="h-3 w-3" /> Remove Object
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Button type="button" variant="outline" onClick={addItem} className="w-full gap-1.5 h-10 border-dashed border-areia/40 text-verde/50 hover:text-telha hover:border-telha/30">
        <Plus className="h-4 w-4" /> Add Object
      </Button>
    </div>
  );
}

// ─── Institutions ────────────────────────────────────────────────────────────

type Institution = {
  name?: string;
  first_invoked?: VerseRef;
  what_it_is?: string;
  role_in_book?: string;
  appears_in?: VerseRef[];
  [k: string]: unknown;
};

export function InstitutionEditor({ data, setData }: { data: unknown; setData: (val: unknown) => void }) {
  const items = Array.isArray(data) ? (data as Institution[]) : [];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const updateItem = (index: number, field: string, value: unknown) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    setData(updated);
  };

  const addItem = () => {
    setData([...items, { name: "", first_invoked: { chapter: 1, verse: 1 }, what_it_is: "", role_in_book: "" }]);
    setOpenIdx(items.length);
  };

  const removeItem = (index: number) => {
    setData(items.filter((_, i) => i !== index));
    setOpenIdx(null);
  };

  return (
    <div className="space-y-2">
      {items.map((inst, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className="rounded-lg border border-areia/20 overflow-hidden bg-surface">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-left hover:bg-surface-alt transition-colors"
            >
              <Building2 className="h-4 w-4 text-verde-claro/50 flex-shrink-0" />
              <span className="flex-1 text-sm font-medium text-preto">{inst.name || `Institution ${i + 1}`}</span>
              <VerseRefBadge verse={inst.first_invoked} />
              {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-verde/30" /> : <ChevronRight className="h-3.5 w-3.5 text-verde/30" />}
            </button>
            {isOpen && (
              <div className="border-t border-areia/15 px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label="Name" readOnly>
                    <ReadOnlyValue value={inst.name ?? ""} />
                  </FieldGroup>
                  <FieldGroup label="First Invoked" readOnly>
                    <div className="flex items-center h-9">
                      <VerseRefBadge verse={inst.first_invoked} />
                    </div>
                  </FieldGroup>
                </div>
                <FieldGroup label="What It Is">
                  <EditableTextarea
                    value={inst.what_it_is ?? ""}
                    onChange={(val) => updateItem(i, "what_it_is", val)}
                    placeholder="Describe this institution or custom..."
                    rows={2}
                  />
                </FieldGroup>
                <FieldGroup label="Role in Book">
                  <EditableInput
                    value={inst.role_in_book ?? ""}
                    onChange={(val) => updateItem(i, "role_in_book", val)}
                    placeholder="How it functions in the narrative"
                  />
                </FieldGroup>
                {Array.isArray(inst.appears_in) && inst.appears_in.length > 0 && (
                  <FieldGroup label="Also Appears In" readOnly>
                    <div className="flex flex-wrap gap-1.5">
                      {inst.appears_in.map((v, vi) => (
                        <VerseRefBadge key={vi} verse={v} />
                      ))}
                    </div>
                  </FieldGroup>
                )}
                <div className="flex justify-end pt-2 border-t border-areia/10">
                  <Button type="button" size="sm" variant="outline" onClick={() => removeItem(i)} className="gap-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="h-3 w-3" /> Remove Institution
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Button type="button" variant="outline" onClick={addItem} className="w-full gap-1.5 h-10 border-dashed border-areia/40 text-verde/50 hover:text-telha hover:border-telha/30">
        <Plus className="h-4 w-4" /> Add Institution
      </Button>
    </div>
  );
}
