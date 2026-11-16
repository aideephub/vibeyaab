import { useSyncExternalStore } from 'react';
import { MAX_QUERY_LENGTH } from './config';

/**
 * Minimal router. Searches live in the query string (`?q=…&f=…`) and the secondary
 * pages in the hash (`#/bookmarks`), which keeps the app working on GitHub Pages
 * project paths without any server-side rewrite rules.
 */
export type Scope = 'all' | 'live' | 'oss' | 'github' | 'directories' | 'bookmarked';
export const SCOPES: readonly Scope[] = ['all', 'live', 'oss', 'github', 'directories', 'bookmarked'];

export type View = 'home' | 'results' | 'bookmarks' | 'settings' | 'about';
const HASH_VIEWS = ['bookmarks', 'settings', 'about'] as const;

export type Route = { view: View; q: string; scope: Scope; xe: string[] };

const NAV_EVENT = 'vibeyaab:navigate';

/**
 * Expansion terms the user removed from this search (`xe=`). English terms,
 * comma-separated; the original query in `q` is never touched by this.
 */
function parseExcludedExpansion(raw: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((term) => term.trim().slice(0, 80))
    .filter((term) => term.length > 0)
    .slice(0, 12);
}

function parseLocation(): Route {
  const params = new URLSearchParams(window.location.search);
  const q = (params.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH);
  const rawScope = params.get('f');
  const scope = SCOPES.find((item) => item === rawScope) ?? 'all';
  const xe = parseExcludedExpansion(params.get('xe'));
  const hashView = window.location.hash.replace(/^#\/?/, '');
  const view = HASH_VIEWS.find((item) => item === hashView);
  if (view) return { view, q: '', scope: 'all', xe: [] };
  return { view: q ? 'results' : 'home', q, scope, xe };
}

let cached: { href: string; route: Route } | null = null;

function getSnapshot(): Route {
  const href = window.location.href;
  if (!cached || cached.href !== href) cached = { href, route: parseLocation() };
  return cached.route;
}

function subscribe(listener: () => void): () => void {
  window.addEventListener('popstate', listener);
  window.addEventListener('hashchange', listener);
  window.addEventListener(NAV_EVENT, listener);
  return () => {
    window.removeEventListener('popstate', listener);
    window.removeEventListener('hashchange', listener);
    window.removeEventListener(NAV_EVENT, listener);
  };
}

export const useRoute = (): Route => useSyncExternalStore(subscribe, getSnapshot);

export function navigate(href: string, options: { replace?: boolean } = {}): void {
  if (options.replace) window.history.replaceState(null, '', href);
  else window.history.pushState(null, '', href);
  window.dispatchEvent(new Event(NAV_EVENT));
}

export function searchHref(q: string, scope: Scope = 'all', excludedExpansion: readonly string[] = []): string {
  const params = new URLSearchParams({ q });
  if (scope !== 'all') params.set('f', scope);
  if (excludedExpansion.length > 0) params.set('xe', excludedExpansion.join(','));
  return `${window.location.pathname}?${params.toString()}`;
}

export function viewHref(view: Exclude<View, 'results'>): string {
  return view === 'home' ? window.location.pathname : `${window.location.pathname}#/${view}`;
}
