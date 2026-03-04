export interface BHSAStatus {
  is_loaded: boolean;
  is_loading: boolean;
  message: string;
}

export interface BHSAClause {
  clause_id: number;
  verse: number;
  text: string;
  gloss: string;
  clause_type: string;
  is_mainline: boolean;
  chain_position: string;
  lemma: string | null;
  lemma_ascii: string | null;
  binyan: string | null;
  tense: string | null;
  subjects: string[];
  objects: string[];
  has_ki: boolean;
  names: string[];
}

export interface BHSAPassageData {
  reference: string;
  source_lang: string;
  clauses: BHSAClause[];
}
