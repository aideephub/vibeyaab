import { MAX_QUERY_LENGTH } from '../lib/config';
import { fetchJson, isHttpUrl, tokenize, truncate } from '../lib/utils';
import { isRepositoryRoot } from './repo';
import type { SearchQuery, SearchResult, SearchSource } from './types';

const ENDPOINT = 'https://vibeking.fun/api/products';

type VibeKingProduct = {
  id: number | string;
  name?: string;
  tagline?: string;
  description?: string;
  url?: string;
  ai_tool?: string;
  category?: string;
  upvotes?: number;
  created_at?: string;
  live_status?: string;
};

type VibeKingResponse = { success: boolean; data?: VibeKingProduct[] };

/** VibeKing timestamps look like `2026-05-29 06:23:29` (UTC, no zone marker). */
function toIso(value: string | undefined): string | null {
  if (!value) return null;
  const time = Date.parse(`${value.replace(' ', 'T')}Z`);
  return Number.isNaN(time) ? null : new Date(time).toISOString();
}

function toResult(product: VibeKingProduct, index: number, offset: number): SearchResult | null {
  const title = product.name?.trim();
  if (!title || !isHttpUrl(product.url)) return null;

  const tagline = product.tagline?.trim() ?? '';
  const description = tagline && !tagline.endsWith('…') ? tagline : product.description?.trim() || tagline;
  const isRepo = isRepositoryRoot(product.url);

  return {
    id: `vibeking:${product.id}`,
    title,
    description: truncate(description, 240),
    url: product.url,
    source: 'vibeking',
    sourceLabel: 'VibeKing',
    category: product.category?.trim() || undefined,
    aiTool: product.ai_tool?.trim() || undefined,
    // The link of a repository listing is a code page, not a running demo.
    isLive: isRepo ? null : product.live_status === 'live' ? true : product.live_status === 'dead' ? false : null,
    isOpenSource: null,
    repositoryUrl: isRepo ? product.url : null,
    createdAt: toIso(product.created_at),
    upvotes: typeof product.upvotes === 'number' ? product.upvotes : null,
    position: offset + index,
  };
}

async function fetchPage(term: string, query: SearchQuery): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    search: term.slice(0, MAX_QUERY_LENGTH),
    sort: query.sort,
    limit: String(query.limit),
    offset: String(query.offset),
  });
  const body = await fetchJson<VibeKingResponse>(`${ENDPOINT}?${params.toString()}`, {
    signal: query.signal,
  });
  if (!body.success || !Array.isArray(body.data)) throw new Error('Unexpected VibeKing response');
  return body.data
    .map((product, index) => toResult(product, index, query.offset))
    .filter((result): result is SearchResult => result !== null);
}

export const vibeking: SearchSource = {
  id: 'vibeking',
  label: { en: 'VibeKing', fa: 'VibeKing' },
  isEnabled: () => true,
  async search(query) {
    const results = await fetchPage(query.q, query);
    if (results.length > 0 || query.offset > 0) return results;

    // VibeKing matches the whole phrase, so a multi-word idea can come back empty.
    // Fall back to the individual keywords and merge what they find.
    const words = [...new Set(tokenize(query.q))].filter((word) => word.length >= 3).slice(0, 3);
    if (words.length < 2) return results;
    const pages = await Promise.allSettled(words.map((word) => fetchPage(word, { ...query, limit: 20 })));
    const seen = new Set<string>();
    return pages
      .flatMap((page) => (page.status === 'fulfilled' ? page.value : []))
      .filter((result) => !seen.has(result.id) && seen.add(result.id));
  },
};
