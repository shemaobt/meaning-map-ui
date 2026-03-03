import type { MeaningMapData, ValidationWarning } from "../types/meaningMap";
import {
  COMMENTARY_WORDS,
  EMBEDDING_MARKERS,
  FRAME_MARKERS,
  MIN_LEVEL1_WORDS,
  MIN_WHAT_HAPPENS_WORDS,
  MIN_PURPOSE_WORDS,
  MIN_PURPOSE_SENTENCES,
} from "../constants/validation";

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function countSentences(text: string): number {
  return text.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim()).length;
}

function hasFiniteVerb(text: string): boolean {
  const lower = text.toLowerCase();
  const patterns = [
    /\b(he|she|it|they|we|i|you)\s+(said|went|came|heard|saw|told|gave|took|made|knew|left|sent|called|rose|put|set|brought|found|turned|opened|returned|fell|cried|did|had|was|were|is|are|has|have)\b/,
    /\b(was|were|is|are)\s+\w+ed\b/,
    /\b(had|has|have)\s+\w+ed\b/,
    /\bwill\s+\w+\b/,
  ];
  return patterns.some((p) => p.test(lower));
}

function hasEmbeddingMarker(text: string): boolean {
  const lower = text.toLowerCase().trim();
  if (EMBEDDING_MARKERS.some((m) => lower.startsWith(m))) return true;
  return /\b(heard|said|told|knew|saw|reported|declared)\s+that\b/.test(lower);
}

function hasCommentary(text: string): boolean {
  const lower = text.toLowerCase();
  return COMMENTARY_WORDS.some((w) => lower.includes(w));
}

function hasFrameMarker(text: string): boolean {
  const lower = text.toLowerCase();
  return FRAME_MARKERS.some((m) => lower.includes(m));
}

export function runChecks(data: MeaningMapData): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  const arc = data.level_1?.arc || "";
  if (!arc.trim()) {
    warnings.push({ section: "level_1", message: "Level 1 arc is empty", severity: "error" });
  } else {
    if (/^[\s]*[-•*]/.test(arc)) {
      warnings.push({
        section: "level_1",
        message: "Level 1 should be prose (bullet points detected)",
        severity: "warning",
      });
    }
    if (/^\s*\d+[.)]\s/m.test(arc)) {
      warnings.push({
        section: "level_1",
        message: "Level 1 should be prose (numbered list detected)",
        severity: "warning",
      });
    }
    if (wordCount(arc) < MIN_LEVEL1_WORDS) {
      warnings.push({
        section: "level_1",
        message: `Level 1 arc is short (${wordCount(arc)} words, minimum ${MIN_LEVEL1_WORDS})`,
        severity: "warning",
      });
    }
  }

  for (const scene of data.level_2_scenes) {
    const prefix = `scene_${scene.scene_number}`;

    if (!scene.people || scene.people.length === 0) {
      warnings.push({ section: `${prefix}_people`, message: "2A: No people entries", severity: "warning" });
    }
    if (!scene.places || scene.places.length === 0) {
      warnings.push({ section: `${prefix}_places`, message: "2B: No places entries", severity: "warning" });
    }
    if (!scene.objects || scene.objects.length === 0) {
      warnings.push({ section: `${prefix}_objects`, message: "2C: No objects entries", severity: "warning" });
    }
    if (wordCount(scene.what_happens || "") < MIN_WHAT_HAPPENS_WORDS) {
      warnings.push({
        section: `${prefix}_what_happens`,
        message: `2D: What Happens is short (${wordCount(scene.what_happens || "")} words, min ${MIN_WHAT_HAPPENS_WORDS})`,
        severity: "warning",
      });
    }

    const purpose = scene.communicative_purpose || "";
    if (!purpose.trim()) {
      warnings.push({ section: `${prefix}_purpose`, message: "2E: Communicative purpose is missing", severity: "error" });
    } else {
      if (wordCount(purpose) < MIN_PURPOSE_WORDS) {
        warnings.push({
          section: `${prefix}_purpose`,
          message: `2E: Purpose is short (${wordCount(purpose)} words, min ${MIN_PURPOSE_WORDS})`,
          severity: "warning",
        });
      }
      if (countSentences(purpose) < MIN_PURPOSE_SENTENCES) {
        warnings.push({
          section: `${prefix}_purpose`,
          message: `2E: Purpose needs at least ${MIN_PURPOSE_SENTENCES} sentences`,
          severity: "warning",
        });
      }
    }
  }

  for (const prop of data.level_3_propositions) {
    const prefix = `prop_${prop.proposition_number}`;

    if (!prop.content || prop.content.length === 0) {
      warnings.push({ section: prefix, message: "Proposition has no Q&A content", severity: "error" });
      continue;
    }

    const firstQ = prop.content[0]?.question?.toLowerCase() || "";
    if (!firstQ.startsWith("what happens")) {
      warnings.push({
        section: prefix,
        message: 'First question must start with "What happens?"',
        severity: "warning",
      });
    }

    for (const qa of prop.content) {
      const answer = qa.answer || "";
      if (hasCommentary(answer)) {
        warnings.push({
          section: prefix,
          message: `Commentary language detected in "${qa.question}"`,
          severity: "warning",
        });
      }
      if (hasFiniteVerb(answer)) {
        warnings.push({
          section: prefix,
          message: `Possible embedded proposition in "${qa.question}" — consider decomposing`,
          severity: "warning",
        });
      }
      if (hasEmbeddingMarker(answer)) {
        warnings.push({
          section: prefix,
          message: `Embedding marker in "${qa.question}" — if this is a clause, decompose it`,
          severity: "warning",
        });
      }
      if (hasFrameMarker(answer)) {
        warnings.push({
          section: prefix,
          message: `Performance frame detected in "${qa.question}" — belongs to target language, not semantic inventory`,
          severity: "warning",
        });
      }
    }
  }

  return warnings;
}
