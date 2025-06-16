import { supabase } from '../utils/supabase';
import { openai } from '../utils/openai';
import type { RuleQuery, RuleResponse, RuleSource, RuleChunk } from '../types/game';

export async function queryRules(question: string, gameId: string): Promise<RuleResponse> {
  // Convert question to embedding
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: question
  });

  // Find relevant rule chunks using vector similarity
  const { data: relevantChunks } = await supabase.rpc('match_rules', {
    query_embedding: embeddingResponse.data[0].embedding,
    game_id_param: gameId,
    match_threshold: 0.7,
    match_count: 5
  });

  if (!relevantChunks || relevantChunks.length === 0) {
    return {
      answer: "I couldn't find any relevant rules to answer your question.",
      sources: [],
      confidence: 0
    };
  }

  // Build context from relevant chunks
  const rulesContext = relevantChunks
    .map((chunk: RuleChunk) => `[${chunk.metadata?.section || 'Unknown'}] ${chunk.content}`)
    .join('\n\n');

  // Generate answer using GPT
  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `You are an expert board game rules assistant. Answer questions accurately based on the official rules provided.

Official Rules:
${rulesContext}

Guidelines:
- Answer clearly and concisely
- Always cite the specific rule section when possible
- If you're uncertain, indicate your confidence level
- Include page numbers when available in the metadata`
      },
      { role: 'user', content: question }
    ],
    max_tokens: 400,
    temperature: 0.3
  });

  return {
    answer: completion.choices[0].message.content || "I couldn't generate an answer.",
    sources: relevantChunks.map((chunk: RuleChunk) => ({
      content: chunk.content,
      page_number: chunk.metadata?.page,
      section: chunk.metadata?.section || 'Unknown',
      source_type: chunk.source_type,
      similarity: chunk.similarity
    })),
    confidence: calculateConfidence(relevantChunks)
  };
}

function calculateConfidence(chunks: any[]): number {
  if (chunks.length === 0) return 0;
  const avgSimilarity = chunks.reduce((sum, chunk) => sum + chunk.similarity, 0) / chunks.length;
  return Math.min(0.95, avgSimilarity);
} 