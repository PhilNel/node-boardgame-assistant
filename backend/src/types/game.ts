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
  metadata: {
    page?: number;
    section: string;
    subsection?: string;
    type: 'setup' | 'gameplay' | 'components' | 'reference' | 'example';
    keywords: string[];
  };
  source_type: 'official' | 'bgg_faq' | 'community';
  similarity?: number;
}

export interface RuleQuery {
  question: string;
  game_id: string;
}

export interface RuleResponse {
  answer: string;
  sources: RuleSource[];
  confidence: number;
  estimated_cost?: number;
  cache_hit?: boolean;
}

export interface RuleSource {
  content: string;
  page_number?: number;
  section: string;
  source_type: string;
  similarity: number;
} 