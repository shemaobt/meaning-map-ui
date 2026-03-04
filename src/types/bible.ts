export interface BibleBook {
  id: string;
  name: string;
  abbreviation: string;
  testament: "OT" | "NT";
  order: number;
  chapter_count: number;
  is_enabled: boolean;
}

export interface ChapterSummary {
  chapter: number;
  pericope_count: number;
  draft_count: number;
  cross_check_count: number;
  approved_count: number;
}

export interface Pericope {
  id: string;
  book_id: string;
  chapter_start: number;
  verse_start: number;
  chapter_end: number;
  verse_end: number;
  reference: string;
  title: string | null;
  created_at: string;
}

export interface PericopeWithStatus extends Pericope {
  meaning_map_id: string | null;
  status: MeaningMapStatus | null;
  locked_by: string | null;
  locked_by_name: string | null;
  analyst_name: string | null;
}

export type MeaningMapStatus = "draft" | "cross_check" | "approved";

export interface AnalystSummary {
  name: string;
  assigned: number;
  draft: number;
  cross_check: number;
  approved: number;
}

export interface DashboardSummary {
  total: number;
  draft: number;
  cross_check: number;
  approved: number;
  unstarted: number;
  enabled_books: number;
  analysts: AnalystSummary[];
}

export interface PericopeCreate {
  book_id: string;
  chapter_start: number;
  verse_start: number;
  chapter_end: number;
  verse_end: number;
  reference: string;
  title?: string;
}
