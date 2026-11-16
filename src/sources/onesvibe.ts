import { MAX_QUERY_LENGTH } from '../lib/config';
import { fetchJson, isHttpUrl, truncate } from '../lib/utils';
import { isRepositoryRoot } from './repo';
import type { SearchResult, SearchSource } from './types';

const ENDPOINT = 'https://onesvibe.app/api/reference';
const LIMIT = 12;

type OnesVibeItem = {
  title?: string;
  tagline?: string;
  url?: string;
  category?: string;
  open_source?: string | null;
  ai_tools?: string[];
  provenance?: {
    onesvibe_url?: string;
    published_at?: string;
    live_status?: string;
  };
};

type OnesVibeResponse = { results?: OnesVibeItem[] };

/** `finance_business` → `Finance business` */
function humanize(value: string | undefined): string | undefined {
  const text = value?.replace(/_/g, ' ').trim();
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : undefined;
}

function toResult(item: OnesVibeItem, index: number): SearchResult | null {
  const title = item.title?.trim();
  if (!title || !isHttpUrl(item.url)) return null;
  const isRepo = isRepositoryRoot(item.url);
  const status = item.provenance?.live_status;
  const tools = (item.ai_tools ?? []).filter(Boolean);

  return {
    id: `onesvibe:${item.url}`,
    title,
    description: truncate(item.tagline ?? '', 240),
    url: item.url,
    source: 'onesvibe',
    sourceLabel: 'One’s Vibe',
    category: humanize(item.category),
    aiTool: tools.length ? tools.join(', ') : undefined,
    isLive: isRepo ? null : status === 'live' ? true : status === 'dead' ? false : null,
    isOpenSource: item.open_source === 'yes' ? true : item.open_source === 'no' ? false : null,
    repositoryUrl: isRepo ? item.url : null,
    createdAt: item.provenance?.published_at ?? null,
    sourceUrl: isHttpUrl(item.provenance?.onesvibe_url) ? item.provenance?.onesvibe_url : null,
    position: index,
  };
}

/** One's Vibe public reference API (CORS-enabled, semantic similarity, no key). */
export const onesvibe: SearchSource = {
  id: 'onesvibe',
  label: { en: 'One’s Vibe', fa: 'One’s Vibe' },
  isEnabled: () => true,
  async search(query) {
    const params = new URLSearchParams({ q: query.q.slice(0, MAX_QUERY_LENGTH), limit: String(LIMIT) });
    const body = await fetchJson<OnesVibeResponse>(`${ENDPOINT}?${params.toString()}`, {
      signal: query.signal,
    });
    if (!Array.isArray(body.results)) throw new Error('Unexpected One’s Vibe response');
    return body.results
      .map(toResult)
      .filter((result): result is SearchResult => result !== null);
  },
};
