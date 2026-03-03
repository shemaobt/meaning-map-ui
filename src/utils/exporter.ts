import type { MeaningMapData } from "../types/meaningMap";

export function buildJSON(data: MeaningMapData): string {
  return JSON.stringify(data, null, 2);
}

export function buildProse(data: MeaningMapData): string {
  const lines: string[] = [];

  lines.push("# Prose Meaning Map\n");
  lines.push("**Method:** Tripod Method\n");
  lines.push("---\n");

  lines.push("#### Level 1 — The Arc\n");
  lines.push((data.level_1?.arc || "") + "\n");
  lines.push("---\n");

  for (const scene of data.level_2_scenes || []) {
    lines.push(
      `#### Level 2 — Scene ${scene.scene_number}: Verses ${scene.verses}\n`
    );
    if (scene.title) lines.push(`**Title:** ${scene.title}\n`);

    lines.push("##### 2A — People\n");
    for (const p of scene.people || []) {
      const parts = [`**${p.name}**`];
      if (p.role) parts.push(`Role: ${p.role}`);
      if (p.relationship) parts.push(`Relationship: ${p.relationship}`);
      if (p.wants) parts.push(`Wants: ${p.wants}`);
      if (p.carries) parts.push(`Carries: ${p.carries}`);
      lines.push(parts.join(" ") + "\n");
    }

    lines.push("##### 2B — Places\n");
    for (const p of scene.places || []) {
      const parts = [`**${p.name}**`];
      if (p.role) parts.push(`Role: ${p.role}`);
      if (p.type) parts.push(`Type: ${p.type}`);
      if (p.meaning) parts.push(`Meaning: ${p.meaning}`);
      if (p.effect_on_scene) parts.push(`Effect on scene: ${p.effect_on_scene}`);
      lines.push(parts.join(" ") + "\n");
    }

    lines.push("##### 2C — Objects and Elements\n");
    for (const o of scene.objects || []) {
      const parts = [`**${o.name}**`];
      if (o.what_it_is) parts.push(`What it is: ${o.what_it_is}`);
      if (o.function_in_scene) parts.push(`Function in scene: ${o.function_in_scene}`);
      if (o.signals) parts.push(`Signals: ${o.signals}`);
      lines.push(parts.join(" ") + "\n");
    }
    if (scene.significant_absence) {
      lines.push(`**Significant absence:** ${scene.significant_absence}\n`);
    }

    lines.push("##### 2D — What Happens\n");
    lines.push((scene.what_happens || "") + "\n");

    lines.push("##### 2E — Communicative Purpose\n");
    lines.push((scene.communicative_purpose || "") + "\n");
    lines.push("---\n");
  }

  lines.push("#### Level 3 — The Propositions\n");
  for (const prop of data.level_3_propositions || []) {
    lines.push(
      `**Proposition ${prop.proposition_number} — Verse ${prop.verse}**\n`
    );
    for (const qa of prop.content || []) {
      lines.push(`${qa.question} ${qa.answer}\n`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
