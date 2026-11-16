import type { Scope } from './router';
import { hostOf, parseTime, SourceError } from './utils';
import type { RankedResult } from './ranking';
import type { SearchQuery, SearchResult, SearchSource, SourceId } from '../sources/types';

export type SourceFailure = { kind: SourceError['kind']; message: string };

export type SourceOutcome =
  | { id: string; results: SearchResult[] }
  | { id: string; failure: SourceFailure };

export const toFailure = (error: unknown): SourceFailure =>
  error instanceof SourceError
    ? { kind: error.kind, message: error.message }
    : { kind: 'network', message: error instanceof Error ? error.message : 'Unknown error' };

/**
 * Runs every source in parallel. `Promise.allSettled` guarantees one failing source can
 * never reject the whole search; each outcome is also reported as soon as it settles so the
 * UI can show results progressively.
 */
export async function runSearch(
  sources: SearchSource[],
  query: SearchQuery,
  onOutcome: (outcome: SourceOutcome) => void,
): Promise<void> {
  await Promise.allSettled(
    sources.map((source) =>
      source.search(query).then(
        (results) => onOutcome({ id: source.id, results }),
        (error: unknown) => {
          if (query.signal?.aborted) return;
          onOutcome({ id: source.id, failure: toFailure(error) });
        },
      ),
    ),
  );
}

/* ------------------------------------------------------------------- filtering */

export type SortKey = 'relevance' | 'newest' | 'upvoted';

export type Filters = {
  scope: Scope;
  source: SourceId | 'all';
  category: string;
  aiTool: string;
  sort: SortKey;
};

export const DEFAULT_FILTERS: Omit<Filters, 'scope'> = {
  source: 'all',
  category: '',
  aiTool: '',
  sort: 'relevance',
};

const DIRECTORY_SOURCES: readonly SourceId[] = ['vibeking', 'onesvibe', 'youraiproject', 'opensaas', 'awesome'];

const isOnGithub = (result: SearchResult): boolean =>
  hostOf(result.url) === 'github.com' || hostOf(result.repositoryUrl) === 'github.com';

export function applyFilters(
  items: RankedResult[],
  filters: Filters,
  isBookmarked: (url: string) => boolean,
): RankedResult[] {
  const filtered = items.filter(({ result }) => {
    switch (filters.scope) {
      case 'live':
        if (result.isLive !== true) return false;
        break;
      case 'oss':
        if (result.isOpenSource !== true) return false;
        break;
      case 'github':
        if (!isOnGithub(result)) return false;
        break;
      case 'directories':
        if (!DIRECTORY_SOURCES.includes(result.source)) return false;
        break;
      case 'bookmarked':
        if (!isBookmarked(result.url)) return false;
        break;
      default:
        break;
    }
    if (filters.source !== 'all' && result.source !== filters.source) return false;
    if (filters.category && result.category !== filters.category) return false;
    if (filters.aiTool && result.aiTool !== filters.aiTool) return false;
    return true;
  });

  if (filters.sort === 'newest') {
    const time = (item: RankedResult) => parseTime(item.result.createdAt ?? item.result.updatedAt) ?? -Infinity;
    return [...filtered].sort((a, b) => time(b) - time(a));
  }
  if (filters.sort === 'upvoted') {
    return [...filtered].sort((a, b) => (b.result.upvotes ?? -1) - (a.result.upvotes ?? -1));
  }
  return filtered;
}

export type Facets = {
  sources: SourceId[];
  categories: string[];
  aiTools: string[];
  canSortNewest: boolean;
  canSortUpvoted: boolean;
};

function topValues(values: Array<string | undefined>, limit: number): string[] {
  const counts = new Map<string, number>();
  for (const value of values) if (value) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([value]) => value);
}

export function computeFacets(items: SearchResult[]): Facets {
  return {
    sources: [...new Set(items.map((item) => item.source))],
    categories: topValues(items.map((item) => item.category), 20),
    aiTools: topValues(items.map((item) => item.aiTool), 20),
    canSortNewest: items.some((item) => item.createdAt || item.updatedAt),
    canSortUpvoted: items.some((item) => typeof item.upvotes === 'number' && item.upvotes > 0),
  };
}
