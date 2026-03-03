export interface BHSAStatus {
  is_loaded: boolean;
  is_loading: boolean;
  message: string;
}

export interface BHSAClause {
  clause_id: number;
  clause_type: string;
  text: string;
  phrases: BHSAPhrase[];
}

export interface BHSAPhrase {
  phrase_id: number;
  phrase_type: string;
  function: string;
  words: BHSAWord[];
}

export interface BHSAWord {
  word_id: number;
  text: string;
  gloss: string;
  pos: string;
  lemma: string;
}

export interface BHSAPassageData {
  reference: string;
  clauses: BHSAClause[];
}
