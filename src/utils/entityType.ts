import type { TFunction } from "i18next";

const ENTITY_TYPE_KEYS: Record<string, string> = {
  person: "entityTypes.person",
  place: "entityTypes.place",
  person_common: "entityTypes.personCommon",
  place_common: "entityTypes.placeCommon",
  ambiguous: "entityTypes.ambiguous",
};

export function humanizeEntityType(value: unknown, t: TFunction): string {
  if (typeof value !== "string" || value.length === 0) return "";
  const key = ENTITY_TYPE_KEYS[value];
  if (key) return t(key);
  return value
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase());
}
