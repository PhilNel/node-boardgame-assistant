# Knowledge Repository

This directory contains the knowledge base for the Board Game Rules Assistant.

## Directory Structure

- `raw/` - Original PDF rulebooks and other source materials
  - Each game should have its own subdirectory
  - Example: `raw/nemesis/rulebook.pdf`

- `processed/` - Extracted and processed content
  - JSON files containing chunked content
  - Metadata about the processing
  - Example: `processed/nemesis/rulebook.json`

- `config/` - Processing configurations
  - Game-specific processing rules
  - Chunking parameters
  - Example: `config/nemesis.json`

## Processing Pipeline

1. Place original PDFs in the `raw/` directory
2. Run the processing script to:
   - Extract text from PDFs
   - Split into meaningful chunks
   - Generate embeddings
   - Store in database
3. Processed content is stored in `processed/` for reference

## Adding New Games

1. Create a game directory in `raw/`
2. Add the rulebook PDF
3. Create a configuration file in `config/`
4. Run the processing script

## File Naming Convention

- Raw files: `{game-slug}-{type}.pdf`
  - Example: `nemesis-rulebook.pdf`, `nemesis-faq.pdf`

- Processed files: `{game-slug}-{type}.json`
  - Example: `nemesis-rulebook.json`, `nemesis-faq.json`

- Config files: `{game-slug}.json`
  - Example: `nemesis.json` 