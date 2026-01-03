export interface KeyConcept {
  term: string;
  definition: string;
  icon?: string; // Optional icon hint
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

export interface PolicyAnalysis {
  title: string;
  summary_tldr: string;
  eli5_explanation: string; // Explain Like I'm 5
  core_concepts: KeyConcept[];
  action_items: ActionItem[];
  mnemonic_device: {
    phrase: string;
    explanation: string;
  };
  flashcards: QuizCard[];
  tone_and_intent: string;
}

export enum AnalysisStatus {
  IDLE,
  ANALYZING,
  SUCCESS,
  ERROR
}