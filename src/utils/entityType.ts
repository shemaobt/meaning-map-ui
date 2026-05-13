import type { TFunction } from "i18next";

const ENTITY_TYPE_KEYS: Record<string, string> = {
  person: "entityTypes.person",
  place: "entityTypes.place",
  person_common: "entityTypes.personCommon",
  place_common: "entityTypes.placeCommon",
  ambiguous: "entityTypes.ambiguous",
};

const PARTICIPANT_TYPE_KEYS: Record<string, string> = {
  named: "editors.named",
  unnamed: "editors.unnamed",
  group: "editors.group",
  divine: "editors.divine",
  role: "editors.role",
};

export function humanizeEntityType(value: unknown, t: TFunction): string {
  if (typeof value !== "string" || value.length === 0) return "";
  const key = ENTITY_TYPE_KEYS[value];
  if (key) return t(key);
  return humanizeFallback(value);
}

export function humanizeParticipantType(value: unknown, t: TFunction): string {
  if (typeof value !== "string" || value.length === 0) return "";
  const key = PARTICIPANT_TYPE_KEYS[value];
  if (key) return t(key);
  return humanizeFallback(value);
}

function humanizeFallback(value: string): string {
  return value.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
}
