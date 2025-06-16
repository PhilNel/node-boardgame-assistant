import { SourceType } from './constants';

export interface Game {
  id: string;
  name: string;
  slug: string;
  bgg_id?: number;
  created_at: string;
}

export interface RuleChunk {
  id: string;
  game_id: string;
  content: string;
  embedding: string;
  metadata: {
    page?: number;
    section: string;
    subsection?: string;
    type: 'setup' | 'gameplay' | 'components' | 'reference' | 'example';
    keywords: string[];
  };
  source_type: SourceType;
  created_at: string;
  similarity?: number;
}

export interface RuleQuery {
  question: string;
  gameId: string;
}

export interface RuleResponse {
  answer: string;
  sources: RuleSource[];
  confidence: number;
}

export interface RuleSource {
  content: string;
  page_number?: number;
  section?: string;
  source_type: SourceType;
  similarity: number;
} 