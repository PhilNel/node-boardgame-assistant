export const SOURCE_TYPES = ['rulebook', 'faq', 'errata', 'bgg'] as const;
export type SourceType = typeof SOURCE_TYPES[number]; 