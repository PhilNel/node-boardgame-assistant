-- Enable the pgvector extension
create extension if not exists vector;

-- Create the games table
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create the rule_chunks table
create table if not exists rule_chunks (
  id uuid primary key default gen_random_uuid(),
  game_id uuid references games(id) on delete cascade not null,
  content text not null,
  metadata jsonb,
  embedding vector(1536),
  source_type text not null check (source_type in ('rulebook', 'faq', 'errata', 'bgg')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create an index for faster similarity search
create index if not exists rule_chunks_embedding_idx on rule_chunks 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);

-- Create the function for similarity search
create or replace function match_rules(
  query_embedding vector(1536),
  game_id_param uuid,
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  source_type text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    rule_chunks.id,
    rule_chunks.content,
    rule_chunks.metadata,
    rule_chunks.source_type,
    1 - (rule_chunks.embedding <=> query_embedding) as similarity
  from rule_chunks
  where rule_chunks.game_id = game_id_param
  and 1 - (rule_chunks.embedding <=> query_embedding) > match_threshold
  order by rule_chunks.embedding <=> query_embedding
  limit match_count;
end;
$$; 