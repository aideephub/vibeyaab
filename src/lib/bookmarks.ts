import { useMemo } from 'react';
import { isSourceId, type SearchResult } from '../sources/types';
import { STORAGE_PREFIX } from './config';
import {
  createStore,
  isLang,
  isTheme,
  recentStore,
  sanitizeSettings,
  settingsStore,
  useStore,
  type Settings,
} from './storage';
import { hashString, isHttpUrl, normalizeUrl, parseTime } from './utils';

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  description?: string;
  source: string;
  sourceUrl?: string;
  repositoryUrl?: string;
  category?: string;
  aiTool?: string;
  isLive?: boolean | null;
  isOpenSource?: boolean | null;
  savedAt: string;
};

/** Stable bookmark ID: a hash of the normalized URL. */
export const bookmarkIdFor = (url: string): string => `bm_${hashString(normalizeUrl(url))}`;

const optionalString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() ? value.trim() : undefined;
const optionalBool = (value: unknown): boolean | null => (typeof value === 'boolean' ? value : null);

/** Validates untrusted data (localStorage or an imported file) into a Bookmark. */
export function sanitizeBookmark(raw: unknown): Bookmark | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const record = raw as Record<string, unknown>;
  const title = optionalString(record.title);
  if (!title || !isHttpUrl(record.url)) return null;
  const savedTime = typeof record.savedAt === 'string' ? parseTime(record.savedAt) : null;
  return {
    id: bookmarkIdFor(record.url),
    title,
    url: record.url,
    description: optionalString(record.description),
    source: optionalString(record.source) ?? 'other',
    sourceUrl: isHttpUrl(record.sourceUrl) ? record.sourceUrl : undefined,
    repositoryUrl: isHttpUrl(record.repositoryUrl) ? record.repositoryUrl : undefined,
    category: optionalString(record.category),
    aiTool: optionalString(record.aiTool),
    isLive: optionalBool(record.isLive),
    isOpenSource: optionalBool(record.isOpenSource),
    savedAt: new Date(savedTime ?? Date.now()).toISOString(),
  };
}

function sanitizeList(raw: unknown): Bookmark[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const list: Bookmark[] = [];
  for (const item of raw) {
    const bookmark = sanitizeBookmark(item);
    if (bookmark && !seen.has(bookmark.id)) {
      seen.add(bookmark.id);
      list.push(bookmark);
    }
  }
  return list;
}

export const bookmarksStore = createStore<Bookmark[]>(`${STORAGE_PREFIX}bookmarks`, () => [], sanitizeList);

export function useBookmarks() {
  const bookmarks = useStore(bookmarksStore);
  const ids = useMemo(() => new Set(bookmarks.map((bookmark) => bookmark.id)), [bookmarks]);
  return { bookmarks, ids };
}

export function resultToBookmark(result: SearchResult): Bookmark {
  return {
    id: bookmarkIdFor(result.url),
    title: result.title,
    url: result.url,
    description: result.description || undefined,
    source: result.source,
    sourceUrl: result.sourceUrl ?? undefined,
    repositoryUrl: result.repositoryUrl ?? undefined,
    category: result.category,
    aiTool: result.aiTool,
    isLive: result.isLive ?? null,
    isOpenSource: result.isOpenSource ?? null,
    savedAt: new Date().toISOString(),
  };
}

export function bookmarkToResult(bookmark: Bookmark): SearchResult {
  const known = isSourceId(bookmark.source);
  return {
    id: bookmark.id,
    title: bookmark.title,
    description: bookmark.description ?? '',
    url: bookmark.url,
    source: known ? (bookmark.source as SearchResult['source']) : 'other',
    sourceLabel: bookmark.source,
    category: bookmark.category,
    aiTool: bookmark.aiTool,
    isLive: bookmark.isLive,
    isOpenSource: bookmark.isOpenSource,
    repositoryUrl: bookmark.repositoryUrl ?? null,
    sourceUrl: bookmark.sourceUrl ?? null,
  };
}

/** Adds the bookmark if absent, removes it if present. Returns `true` when it was added. */
export function toggleBookmark(result: SearchResult): boolean {
  const list = bookmarksStore.get();
  const id = bookmarkIdFor(result.url);
  if (list.some((bookmark) => bookmark.id === id)) {
    bookmarksStore.set(list.filter((bookmark) => bookmark.id !== id));
    return false;
  }
  bookmarksStore.set([resultToBookmark(result), ...list]);
  return true;
}

export function removeBookmark(id: string): void {
  bookmarksStore.set(bookmarksStore.get().filter((bookmark) => bookmark.id !== id));
}

/** Merges incoming bookmarks without duplicating or overwriting existing ones. */
export function mergeBookmarks(existing: Bookmark[], incoming: Bookmark[]) {
  const known = new Set(existing.map((bookmark) => bookmark.id));
  const fresh = incoming.filter((bookmark) => {
    if (known.has(bookmark.id)) return false;
    known.add(bookmark.id);
    return true;
  });
  return {
    merged: [...fresh, ...existing].sort((a, b) => b.savedAt.localeCompare(a.savedAt)),
    added: fresh.length,
    skipped: incoming.length - fresh.length,
  };
}

/* -------------------------------------------------------------- export / import */

const EXPORT_APP = 'VibeYaab';
const EXPORT_VERSION = 1;

export function buildExport(): string {
  return JSON.stringify(
    {
      app: EXPORT_APP,
      version: EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      settings: settingsStore.get(),
      bookmarks: bookmarksStore.get(),
    },
    null,
    2,
  );
}

export type ParsedImport = { bookmarks: Bookmark[]; settings: Partial<Settings> | null };

/** Parses and validates an export file. Throws an `Error` whose message is `invalid` on bad input. */
export function parseImport(text: string): ParsedImport {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('invalid');
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) throw new Error('invalid');
  const record = data as Record<string, unknown>;
  if (record.app !== EXPORT_APP || !Array.isArray(record.bookmarks)) throw new Error('invalid');

  let settings: Partial<Settings> | null = null;
  if (typeof record.settings === 'object' && record.settings !== null) {
    const raw = record.settings as Record<string, unknown>;
    const clean = sanitizeSettings(raw);
    settings = {};
    if (isLang(raw.lang)) settings.lang = clean.lang;
    if (isTheme(raw.theme)) settings.theme = clean.theme;
    if (typeof raw.githubApi === 'boolean') settings.githubApi = clean.githubApi;
  }
  return { bookmarks: sanitizeList(record.bookmarks), settings };
}

export function clearAllLocalData(): void {
  bookmarksStore.reset();
  recentStore.reset();
  settingsStore.reset();
}
