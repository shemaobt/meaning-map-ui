export interface PersonEntry {
  [key: string]: string;
  name: string;
  role: string;
  relationship: string;
  wants: string;
  carries: string;
}

export interface PlaceEntry {
  [key: string]: string;
  name: string;
  role: string;
  type: string;
  meaning: string;
  effect_on_scene: string;
}

export interface ObjectEntry {
  [key: string]: string;
  name: string;
  what_it_is: string;
  function_in_scene: string;
  signals: string;
}

export interface QAPair {
  question: string;
  answer: string;
}

export interface Scene {
  scene_number: number;
  verses: string;
  title: string;
  people: PersonEntry[];
  places: PlaceEntry[];
  objects: ObjectEntry[];
  significant_absence: string;
  what_happens: string;
  communicative_purpose: string;
}

export interface Proposition {
  proposition_number: number;
  verse: string;
  content: QAPair[];
}

export interface MeaningMapData {
  level_1: { arc: string };
  level_2_scenes: Scene[];
  level_3_propositions: Proposition[];
}

export interface MeaningMap {
  id: string;
  pericope_id: string;
  analyst_id: string;
  cross_checker_id: string | null;
  status: "draft" | "cross_check" | "approved";
  version: number;
  data: MeaningMapData;
  locked_by: string | null;
  locked_at: string | null;
  date_approved: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MeaningMapFeedback {
  id: string;
  meaning_map_id: string;
  section_key: string;
  author_id: string;
  author_name: string;
  content: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ValidationWarning {
  section: string;
  message: string;
  severity: "warning" | "error";
}

export interface ReviewState {
  reviewed: Record<string, boolean>;
  warnings: ValidationWarning[];
}
