import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, ChevronRight, MapPin, Package, Building2, Plus, Trash2 } from "lucide-react";
import {
  FieldGroup,
  VerseRefBadge,
  VerseRefInput,
  EditableInput,
  EditableTextarea,
} from "./FieldPrimitives";
import { Button } from "../../../ui/button";

type VerseRef = { chapter?: number; verse?: number };

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
  const { t } = useTranslation();
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
                {pl.english_gloss && <span className="text-sm text-verde/70 ml-2">{pl.english_gloss}</span>}
                {pl.type && <span className="text-xs text-verde/40 ml-2">{pl.type}</span>}
              </div>
              <VerseRefBadge verse={pl.first_appears} />
              {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-verde/30" /> : <ChevronRight className="h-3.5 w-3.5 text-verde/30" />}
            </button>
            {isOpen && (
              <div className="border-t border-areia/15 px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label={t("fields.name")}>
                    <EditableInput
                      value={pl.name ?? ""}
                      onChange={(val) => updateItem(i, "name", val)}
                      placeholder={t("editors.placeholders.hebrewName")}
                    />
                  </FieldGroup>
                  <FieldGroup label={t("fields.englishGloss")}>
                    <EditableInput
                      value={pl.english_gloss ?? ""}
                      onChange={(val) => updateItem(i, "english_gloss", val)}
                      placeholder={t("editors.placeholders.englishMeaning")}
                    />
                  </FieldGroup>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label={t("fields.firstAppears")}>
                    <VerseRefInput
                      verse={pl.first_appears}
                      onChange={(val) => updateItem(i, "first_appears", val)}
                    />
                  </FieldGroup>
                  <FieldGroup label={t("fields.type")}>
                    <EditableInput
                      value={pl.type ?? ""}
                      onChange={(val) => updateItem(i, "type", val)}
                      placeholder={t("editors.placeholders.placeType")}
                    />
                  </FieldGroup>
                </div>
                <FieldGroup label={t("fields.meaningAndFunction")}>
                  <EditableTextarea
                    value={pl.meaning_and_function ?? ""}
                    onChange={(val) => updateItem(i, "meaning_and_function", val)}
                    placeholder={t("editors.placeholders.placeSignificance")}
                    rows={2}
                  />
                </FieldGroup>
                <VerseRefListField
                  label={t("fields.alsoAppearsIn")}
                  verses={Array.isArray(pl.appears_in) ? pl.appears_in : []}
                  onChange={(verses) => updateItem(i, "appears_in", verses)}
                  addLabel={t("editors.addVerse")}
                />
                <div className="flex justify-end pt-2 border-t border-areia/10">
                  <Button type="button" size="sm" variant="outline" onClick={() => removeItem(i)} className="gap-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="h-3 w-3" /> {t("editors.removePlace")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Button type="button" variant="outline" onClick={addItem} className="w-full gap-1.5 h-10 border-dashed border-areia/40 text-verde/50 hover:text-telha hover:border-telha/30">
        <Plus className="h-4 w-4" /> {t("editors.addPlace")}
      </Button>
    </div>
  );
}

type Obj = {
  name?: string;
  english_gloss?: string;
  first_appears?: VerseRef;
  what_it_is?: string;
  meaning_across_scenes?: string;
  appears_in?: VerseRef[];
  [k: string]: unknown;
};

export function ObjectEditor({ data, setData }: { data: unknown; setData: (val: unknown) => void }) {
  const { t } = useTranslation();
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
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-preto">{obj.name || `Object ${i + 1}`}</span>
                {obj.english_gloss && <span className="text-sm text-verde/70 ml-2">{obj.english_gloss}</span>}
              </div>
              <VerseRefBadge verse={obj.first_appears} />
              {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-verde/30" /> : <ChevronRight className="h-3.5 w-3.5 text-verde/30" />}
            </button>
            {isOpen && (
              <div className="border-t border-areia/15 px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label={t("fields.name")}>
                    <EditableInput
                      value={obj.name ?? ""}
                      onChange={(val) => updateItem(i, "name", val)}
                      placeholder={t("editors.placeholders.hebrewName")}
                    />
                  </FieldGroup>
                  <FieldGroup label={t("fields.englishGloss")}>
                    <EditableInput
                      value={obj.english_gloss ?? ""}
                      onChange={(val) => updateItem(i, "english_gloss", val)}
                      placeholder={t("editors.placeholders.englishMeaning")}
                    />
                  </FieldGroup>
                </div>
                <FieldGroup label={t("fields.firstAppears")}>
                  <VerseRefInput
                    verse={obj.first_appears}
                    onChange={(val) => updateItem(i, "first_appears", val)}
                  />
                </FieldGroup>
                <FieldGroup label={t("fields.whatItIsLabel")}>
                  <EditableTextarea
                    value={obj.what_it_is ?? ""}
                    onChange={(val) => updateItem(i, "what_it_is", val)}
                    placeholder={t("editors.placeholders.objectDescription")}
                    rows={2}
                  />
                </FieldGroup>
                <FieldGroup label={t("fields.meaningAcrossScenes")}>
                  <EditableTextarea
                    value={obj.meaning_across_scenes ?? ""}
                    onChange={(val) => updateItem(i, "meaning_across_scenes", val)}
                    placeholder={t("editors.placeholders.objectMeaning")}
                    rows={2}
                  />
                </FieldGroup>
                <VerseRefListField
                  label={t("fields.alsoAppearsIn")}
                  verses={Array.isArray(obj.appears_in) ? obj.appears_in : []}
                  onChange={(verses) => updateItem(i, "appears_in", verses)}
                  addLabel={t("editors.addVerse")}
                />
                <div className="flex justify-end pt-2 border-t border-areia/10">
                  <Button type="button" size="sm" variant="outline" onClick={() => removeItem(i)} className="gap-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="h-3 w-3" /> {t("editors.removeObject")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Button type="button" variant="outline" onClick={addItem} className="w-full gap-1.5 h-10 border-dashed border-areia/40 text-verde/50 hover:text-telha hover:border-telha/30">
        <Plus className="h-4 w-4" /> {t("editors.addObject")}
      </Button>
    </div>
  );
}

type Institution = {
  name?: string;
  english_gloss?: string;
  first_invoked?: VerseRef;
  what_it_is?: string;
  role_in_book?: string;
  appears_in?: VerseRef[];
  [k: string]: unknown;
};

export function InstitutionEditor({ data, setData }: { data: unknown; setData: (val: unknown) => void }) {
  const { t } = useTranslation();
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
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-preto">{inst.name || `Institution ${i + 1}`}</span>
                {inst.english_gloss && <span className="text-sm text-verde/70 ml-2">{inst.english_gloss}</span>}
              </div>
              <VerseRefBadge verse={inst.first_invoked} />
              {isOpen ? <ChevronDown className="h-3.5 w-3.5 text-verde/30" /> : <ChevronRight className="h-3.5 w-3.5 text-verde/30" />}
            </button>
            {isOpen && (
              <div className="border-t border-areia/15 px-4 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FieldGroup label={t("fields.name")}>
                    <EditableInput
                      value={inst.name ?? ""}
                      onChange={(val) => updateItem(i, "name", val)}
                      placeholder={t("editors.placeholders.hebrewName")}
                    />
                  </FieldGroup>
                  <FieldGroup label={t("fields.englishGloss")}>
                    <EditableInput
                      value={inst.english_gloss ?? ""}
                      onChange={(val) => updateItem(i, "english_gloss", val)}
                      placeholder={t("editors.placeholders.englishMeaning")}
                    />
                  </FieldGroup>
                </div>
                <FieldGroup label={t("fields.firstInvoked")}>
                  <VerseRefInput
                    verse={inst.first_invoked}
                    onChange={(val) => updateItem(i, "first_invoked", val)}
                  />
                </FieldGroup>
                <FieldGroup label={t("fields.whatItIsLabel")}>
                  <EditableTextarea
                    value={inst.what_it_is ?? ""}
                    onChange={(val) => updateItem(i, "what_it_is", val)}
                    placeholder={t("editors.placeholders.institutionDescription")}
                    rows={2}
                  />
                </FieldGroup>
                <FieldGroup label={t("fields.roleInBook")}>
                  <EditableInput
                    value={inst.role_in_book ?? ""}
                    onChange={(val) => updateItem(i, "role_in_book", val)}
                    placeholder={t("editors.placeholders.institutionRole")}
                  />
                </FieldGroup>
                <VerseRefListField
                  label={t("fields.alsoAppearsIn")}
                  verses={Array.isArray(inst.appears_in) ? inst.appears_in : []}
                  onChange={(verses) => updateItem(i, "appears_in", verses)}
                  addLabel={t("editors.addVerse")}
                />
                <div className="flex justify-end pt-2 border-t border-areia/10">
                  <Button type="button" size="sm" variant="outline" onClick={() => removeItem(i)} className="gap-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200">
                    <Trash2 className="h-3 w-3" /> {t("editors.removeInstitution")}
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Button type="button" variant="outline" onClick={addItem} className="w-full gap-1.5 h-10 border-dashed border-areia/40 text-verde/50 hover:text-telha hover:border-telha/30">
        <Plus className="h-4 w-4" /> {t("editors.addInstitution")}
      </Button>
    </div>
  );
}

function VerseRefListField({
  label,
  verses,
  onChange,
  addLabel,
}: {
  label: string;
  verses: { chapter?: number; verse?: number }[];
  onChange: (verses: { chapter: number; verse: number }[]) => void;
  addLabel: string;
}) {
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
              onClick={() => onChange(verses.filter((_, j) => j !== vi) as { chapter: number; verse: number }[])}
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
        onClick={() => onChange([...verses, { chapter: 1, verse: 1 }] as { chapter: number; verse: number }[])}
        className="gap-1 h-7 text-xs mt-2"
      >
        <Plus className="h-3 w-3" /> {addLabel}
      </Button>
    </FieldGroup>
  );
}
