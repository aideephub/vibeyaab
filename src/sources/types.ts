import type { Lang } from '../lib/config';

export type SourceId =
  | 'vibeking'
  | 'google'
  | 'github'
  | 'youraiproject'
  | 'onesvibe'
  | 'opensaas'
  | 'awesome'
  | 'other';

export const SOURCE_IDS: readonly SourceId[] = [
  'vibeking',
  'google',
  'github',
  'youraiproject',
  'onesvibe',
  'opensaas',
  'awesome',
  'other',
];

export const isSourceId = (value: unknown): value is SourceId =>
  SOURCE_IDS.some((id) => id === value);

export type SearchResult = {
  id: string;
  title: string;
  description: string;
  url: string;
  source: SourceId;
  sourceLabel: string;
  category?: string;
  aiTool?: string;
  /** `true` only when the source reports the URL as live; `null` when unknown. */
  isLive?: boolean | null;
  /** `true` only when the source states it is open source (or a license is reported). */
  isOpenSource?: boolean | null;
  repositoryUrl?: string | null;
  createdAt?: string | null;
  /** Last-update time, when the source provides one. */
  updatedAt?: string | null;
  upvotes?: number | null;
  /** Page on the source site that describes this project, when known. */
  sourceUrl?: string | null;
  /** Set when the result was discovered through the Google Programmable Search Element. */
  via?: 'google';
  /** Zero-based position in the source's own ordering. */
  position?: number;
};

export type SearchQuery = {
  q: string;
  limit: number;
  offset: number;
  sort: 'top' | 'new';
  signal?: AbortSignal;
};

export interface SearchSource {
  id: string;
  label: Record<Lang, string>;
  search(query: SearchQuery): Promise<SearchResult[]>;
  isEnabled(): boolean;
}
