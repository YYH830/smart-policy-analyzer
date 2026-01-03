export interface KeyConcept {
  term: string;
  definition: string;
}

export interface QuizCard {
  question: string;
  answer: string;
}

export interface ActionItem {
  who: string;
  what: string;
  deadline?: string;
}

export interface Source {
  title: string;
  uri: string;
}

export interface HistoryVersion {
  date: string;
  version_name: string;
  change_summary: string;
}

export interface PolicyArticle {
  chapter?: string;
  article_number: string;
  content: string;
  system_design_implication?: string; // Specific highlight for PM/System Design
  design_priority: 'high' | 'medium' | 'low' | 'none';
}

export interface PolicyAnalysis {
  title: string;
  // 1. History
  history: HistoryVersion[];
  
  // 2. Latest Core Points
  summary_tldr: string;
  core_concepts: KeyConcept[];
  
  // 3. Detailed Articles with PM Highlights
  articles: PolicyArticle[];

  // Extras (Keeping these as they are useful)
  flashcards: QuizCard[];
  tone_and_intent: string;
  sources?: Source[];
}

export enum AnalysisStatus {
  IDLE,
  ANALYZING,
  SUCCESS,
  ERROR
}