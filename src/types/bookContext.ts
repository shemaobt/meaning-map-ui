export type BCDStatus = "generating" | "draft" | "review" | "approved";

export interface BCDListItem {
  id: string;
  book_id: string;
  section_label: string | null;
  version: number;
  is_active: boolean;
  status: BCDStatus;
  prepared_by: string;
  created_at: string;
  updated_at: string;
}

export interface BCD extends BCDListItem {
  section_range_start: number | null;
  section_range_end: number | null;
  structural_outline: Record<string, unknown> | null;
  participant_register: Record<string, unknown>[] | null;
  discourse_threads: Record<string, unknown>[] | null;
  theological_spine: string | null;
  places: Record<string, unknown>[] | null;
  objects: Record<string, unknown>[] | null;
  institutions: Record<string, unknown>[] | null;
  genre_context: Record<string, unknown> | null;
  maintenance_notes: Record<string, unknown> | null;
  generation_metadata: Record<string, unknown> | null;
}

export interface BCDFeedback {
  id: string;
  bcd_id: string;
  section_key: string;
  author_id: string;
  content: string;
  resolved: boolean;
  created_at: string;
  updated_at: string;
}

export interface BCDGenerationLog {
  id: string;
  bcd_id: string;
  step_name: string;
  step_order: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  input_summary: string | null;
  output_summary: string | null;
  token_count: number | null;
  error_detail: string | null;
}

export interface EstablishedItem {
  category: string;
  name: string;
  english_gloss: string;
  description: string;
  verse_reference: string;
}

export interface PassageEntryBrief {
  participants: Record<string, unknown>[];
  active_threads: Record<string, unknown>[];
  places: Record<string, unknown>[];
  objects: Record<string, unknown>[];
  institutions: Record<string, unknown>[];
  established_items: EstablishedItem[];
  is_first_pericope: boolean;
  bcd_version: number;
}

export interface StalenessResult {
  is_stale: boolean;
  current_version?: number;
}

export interface ValidationIssue {
  severity: "error" | "warning";
  message: string;
  section: string;
}
