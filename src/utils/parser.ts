import type { MeaningMapData, Scene, Proposition, QAPair } from "../types/meaningMap";

function cleanSeparators(text: string): string {
  return text
    .replace(/^[\s]*[-=─━]{3,}[\s]*$/gm, "")
    .replace(/\n{3,}/g, "\n\n");
}

function fieldKey(f: string): string {
  return f.toLowerCase().replace(/\s+/g, "_");
}

function extractFieldValue(text: string, fieldName: string, nextFields: string[]): string {
  const escapedField = fieldName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const lookahead = nextFields
    .map((f) => f.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const pattern = lookahead
    ? new RegExp(`${escapedField}:\\s*(.*?)(?=(?:${lookahead}):|$)`, "is")
    : new RegExp(`${escapedField}:\\s*(.*)`, "is");
  const m = text.match(pattern);
  return m ? m[1].trim() : "";
}

function parseBoldEntries(
  text: string,
  fields: string[]
): Array<Record<string, string>> {
  const entries: Array<Record<string, string>> = [];
  const parts = text.split(/\*\*([^*]+)\*\*/);

  for (let i = 1; i < parts.length; i += 2) {
    const name = parts[i].trim();
    const body = (parts[i + 1] || "").trim();
    const entry: Record<string, string> = { name };

    for (let j = 0; j < fields.length; j++) {
      const remaining = fields.slice(j + 1);
      entry[fieldKey(fields[j])] = extractFieldValue(body, fields[j], remaining);
    }

    entries.push(entry);
  }

  return entries;
}

function extractSubsection(text: string, label: string, nextLabels: string[]): string {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const lookahead = nextLabels
    .map((l) => l.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const pattern = lookahead
    ? new RegExp(
        `#{1,5}\\s*${escapedLabel}[^\\n]*\\n([\\s\\S]*?)(?=#{1,5}\\s*(?:${lookahead})|$)`,
        "i"
      )
    : new RegExp(`#{1,5}\\s*${escapedLabel}[^\\n]*\\n([\\s\\S]*)`, "i");
  const m = text.match(pattern);
  return m ? m[1].trim() : "";
}

function parseScene(num: string, verses: string, text: string): Scene {
  const titleMatch = text.match(/\*\*Title:\*\*\s*(.+)/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  const peopleText = extractSubsection(text, "2A", ["2B", "2C", "2D", "2E"]);
  const placesText = extractSubsection(text, "2B", ["2C", "2D", "2E"]);
  const objectsText = extractSubsection(text, "2C", ["2D", "2E"]);
  const whatHappensText = extractSubsection(text, "2D", ["2E"]);
  const purposeText = extractSubsection(text, "2E", []);

  const people = parseBoldEntries(peopleText, [
    "Role",
    "Relationship",
    "Wants",
    "Carries",
  ]).map((e) => ({
    name: e.name || "",
    role: e.role || "",
    relationship: e.relationship || "",
    wants: e.wants || "",
    carries: e.carries || "",
  }));

  const places = parseBoldEntries(placesText, [
    "Role",
    "Type",
    "Meaning",
    "Effect on scene",
  ]).map((e) => ({
    name: e.name || "",
    role: e.role || "",
    type: e.type || "",
    meaning: e.meaning || "",
    effect_on_scene: e.effect_on_scene || "",
  }));

  const absenceMatch = objectsText.match(
    /\*\*Significant\s+absence:\*\*\s*([\s\S]*?)(?=\*\*|$)/i
  );
  const significant_absence = absenceMatch ? absenceMatch[1].trim() : "";
  const objectsClean = objectsText
    .replace(/\*\*Significant\s+absence:\*\*[\s\S]*/i, "")
    .trim();

  const objects = parseBoldEntries(objectsClean, [
    "What it is",
    "Function in scene",
    "Signals",
  ]).map((e) => ({
    name: e.name || "",
    what_it_is: e.what_it_is || "",
    function_in_scene: e.function_in_scene || "",
    signals: e.signals || "",
  }));

  return {
    scene_number: parseInt(num),
    verses: verses.replace(/[\u2013\u2014]/g, "-"),
    title,
    people,
    places,
    objects,
    significant_absence,
    what_happens: cleanSeparators(whatHappensText),
    communicative_purpose: cleanSeparators(purposeText),
  };
}

function parsePropositions(text: string): Proposition[] {
  const props: Proposition[] = [];
  const propRe =
    /\*\*Proposition\s+(\d+)\s*(?:—|-)\s*Verse[s]?\s*([\d\u2013\u2014\-:,\s]+)\*\*/gi;
  const splits = text.split(propRe);

  for (let i = 1; i < splits.length; i += 3) {
    const num = parseInt(splits[i]);
    const verse = splits[i + 1].trim().replace(/[\u2013\u2014]/g, "-");
    const body = (splits[i + 2] || "").trim();

    const content: QAPair[] = [];
    const lines = body.split("\n").filter((l) => l.trim());
    for (const line of lines) {
      const qMatch = line.match(/^(.+?\?)\s*(.*)$/);
      if (qMatch) {
        content.push({ question: qMatch[1].trim(), answer: qMatch[2].trim() });
      }
    }

    props.push({ proposition_number: num, verse, content });
  }

  return props;
}

export function parseMap(raw: string): MeaningMapData {
  const text = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  let arc = "";
  const l1m = text.match(
    /#{1,4}\s*Level\s*1[^\n]*\n([\s\S]*?)(?=#{1,4}\s*Level\s*[23]|$)/i
  );
  if (l1m) {
    arc = cleanSeparators(l1m[1]).trim();
  }

  const scenes: Scene[] = [];
  const sceneRe =
    /#{1,4}\s*Level\s*2[^\n]*Scene\s*(\d+)[^\n]*Verses?\s*([\d\u2013\u2014\-:,\s]+)[^\n]*\n([\s\S]*?)(?=#{1,4}\s*Level|$)/gi;
  let sm: RegExpExecArray | null;
  while ((sm = sceneRe.exec(text)) !== null) {
    scenes.push(parseScene(sm[1], sm[2].trim(), sm[3]));
  }

  let propositions: Proposition[] = [];
  const l3m = text.match(/#{1,4}\s*Level\s*3[^\n]*\n([\s\S]*?)$/i);
  if (l3m) {
    propositions = parsePropositions(l3m[1]);
  }

  return {
    level_1: { arc },
    level_2_scenes: scenes,
    level_3_propositions: propositions,
  };
}
