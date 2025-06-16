import { sql } from '../utils/db';
import { Game, RuleChunk } from '../types/game';

function createVector(value: number): string {
    return `[${Array(1536).fill(value).join(',')}]`;
}

const testRules: Omit<RuleChunk, 'id' | 'game_id' | 'created_at'>[] = [
    {
        content: 'Test rule 1',
        embedding: createVector(0.1),
        metadata: {
            section: 'Setup',
            type: 'setup',
            keywords: ['test', 'setup']
        },
        source_type: 'rulebook'
    },
    {
        content: 'Test rule 2',
        embedding: createVector(0.2),
        metadata: {
            section: 'Gameplay',
            type: 'gameplay',
            keywords: ['test', 'gameplay']
        },
        source_type: 'rulebook'
    },
    {
        content: 'Test rule 3',
        embedding: createVector(0.3),
        metadata: {
            section: 'Components',
            type: 'components',
            keywords: ['test', 'components']
        },
        source_type: 'rulebook'
    }
];

async function createTestGame(): Promise<string> {
    const result = await sql<Game[]>`
    INSERT INTO games (name)
    VALUES ('Test Game')
    RETURNING id
  `;
    const game = result[0];
    console.log('Created test game with ID:', game.id);
    return game.id;
}

async function insertRuleChunks(gameId: string, rules: Omit<RuleChunk, 'id' | 'game_id' | 'created_at'>[]) {
    for (const rule of rules) {
        await sql`
      INSERT INTO rule_chunks (
        game_id,
        content,
        embedding,
        metadata,
        source_type
      ) VALUES (
        ${gameId},
        ${rule.content},
        ${rule.embedding}::vector,
        ${JSON.stringify(rule.metadata)}::jsonb,
        ${rule.source_type}
      )
    `;
    }
    console.log(`Inserted ${rules.length} rule chunks`);
}

async function testSimilaritySearch(gameId: string) {
    const queryEmbedding = createVector(0.15);
    const result = await sql`
    SELECT 
      content,
      metadata,
      source_type,
      embedding <-> ${queryEmbedding}::vector as similarity
    FROM rule_chunks
    WHERE game_id = ${gameId}
    ORDER BY similarity ASC
    LIMIT 2
  `;
    console.log('Similarity search results:', result);
}

async function cleanupTestData(gameId: string) {
    await sql`
    DELETE FROM games
    WHERE id = ${gameId}
  `;
    console.log('Cleaned up test data');
}

async function testDatabase() {
    let gameId: string | null = null;

    try {
        gameId = await createTestGame();
        await insertRuleChunks(gameId, testRules);
        await testSimilaritySearch(gameId);

    } catch (error) {
        console.error('Test failed:', error);
        throw error;
    } finally {
        if (gameId) {
            await cleanupTestData(gameId);
        }
        await sql.end();
    }
}

testDatabase().catch(console.error);