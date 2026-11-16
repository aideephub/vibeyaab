import { settingsStore } from '../lib/storage';
import { fetchJson, truncate } from '../lib/utils';
import type { SearchResult, SearchSource } from './types';

const ENDPOINT = 'https://api.github.com/search/repositories';

type GitHubRepo = {
  full_name: string;
  html_url: string;
  description: string | null;
  created_at?: string;
  pushed_at?: string;
  license?: { spdx_id?: string | null } | null;
};

type GitHubResponse = { items?: GitHubRepo[] };

/** Session-only cache so repeating a search never spends extra rate-limit budget. */
const cache = new Map<string, SearchResult[]>();

function toResult(repo: GitHubRepo, index: number): SearchResult {
  const licensed = Boolean(repo.license?.spdx_id) && repo.license?.spdx_id !== 'NOASSERTION';
  return {
    id: `github:${repo.full_name}`,
    title: repo.full_name,
    description: truncate(repo.description ?? '', 240),
    url: repo.html_url,
    source: 'github',
    sourceLabel: 'GitHub',
    isLive: null,
    isOpenSource: licensed ? true : null,
    repositoryUrl: repo.html_url,
    createdAt: repo.created_at ?? null,
    updatedAt: repo.pushed_at ?? null,
    position: index,
  };
}

/**
 * Opt-in adapter for GitHub's public repository search. It is disabled unless the
 * user turns it on in Settings, runs only on explicit search submission, and reports
 * 403/429 responses as a rate-limit failure.
 */
export const github: SearchSource = {
  id: 'github',
  label: { en: 'GitHub', fa: 'GitHub' },
  isEnabled: () => settingsStore.get().githubApi,
  async search(query) {
    const key = query.q.toLowerCase();
    const hit = cache.get(key);
    if (hit) return hit;

    const params = new URLSearchParams({
      q: `${query.q} vibe coding in:name,description,readme`,
      per_page: '10',
    });
    const body = await fetchJson<GitHubResponse>(`${ENDPOINT}?${params.toString()}`, {
      signal: query.signal,
      headers: { Accept: 'application/vnd.github+json' },
    });
    const results = (body.items ?? []).map(toResult);
    cache.set(key, results);
    return results;
  },
};
