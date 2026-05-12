export type Curriculum = 'CN' | 'US' | 'UK' | 'SG' | 'IB';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Grade = '6' | '7' | '8' | '9';
export type Language = 'zh' | 'en';

export interface Concept {
  id: string;
  title: { zh: string; en: string };
  module: string;
  level: number;
  description: { zh: string; en: string };
  skills: { zh: string; en: string }[];
  emphasis: Partial<Record<Curriculum, { zh: string; en: string }>>;
  relatedNodes?: string[];
  specificFocus?: { zh: string; en: string };
}

export interface KnowledgeModule {
  id: string;
  name: { zh: string; en: string };
  concepts: Concept[];
}

export interface Message {
  role: 'user' | 'model';
  content: string;
  type?: 'text' | 'question' | 'example' | 'exercise' | 'correction';
}
