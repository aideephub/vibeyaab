import { useSyncExternalStore } from 'react';
import { MAX_RECENT_SEARCHES, STORAGE_PREFIX, type Lang } from './config';

export interface Store<T> {
  readonly key: string;
  get(): T;
  set(next: T): void;
  reset(): void;
  subscribe(listener: () => void): () => void;
}

/**
 * A tiny localStorage-backed store compatible with `useSyncExternalStore`.
 * Reads are cached; the cache is invalidated when another tab changes the same key.
 */
export function createStore<T>(key: string, fallback: () => T, sanitize: (raw: unknown) => T): Store<T> {
  let cache: { value: T } | null = null;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((listener) => listener());

  const read = (): T => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback() : sanitize(JSON.parse(raw));
    } catch {
      return fallback();
    }
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key === key || event.key === null) {
      cache = null;
      emit();
    }
  };

  return {
    key,
    get() {
      if (!cache) cache = { value: read() };
      return cache.value;
    },
    set(next) {
      cache = { value: next };
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* Storage may be full or blocked; keep the in-memory value for this session. */
      }
      emit();
    },
    reset() {
      cache = null;
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      emit();
    },
    subscribe(listener) {
      if (listeners.size === 0) window.addEventListener('storage', onStorage);
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
        if (listeners.size === 0) window.removeEventListener('storage', onStorage);
      };
    },
  };
}

export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(store.subscribe, store.get);
}

/* ------------------------------------------------------------------ settings */

export type Theme = 'system' | 'light' | 'dark';

export type Settings = {
  lang: Lang;
  theme: Theme;
  /** Opt-in: query GitHub's public repository search API (rate limited). */
  githubApi: boolean;
};

export const isLang = (value: unknown): value is Lang => value === 'en' || value === 'fa';
export const isTheme = (value: unknown): value is Theme =>
  value === 'system' || value === 'light' || value === 'dark';

export function defaultSettings(): Settings {
  const browserLang = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'en';
  return { lang: browserLang.startsWith('fa') ? 'fa' : 'en', theme: 'system', githubApi: false };
}

export function sanitizeSettings(raw: unknown): Settings {
  const base = defaultSettings();
  if (typeof raw !== 'object' || raw === null) return base;
  const record = raw as Record<string, unknown>;
  return {
    lang: isLang(record.lang) ? record.lang : base.lang,
    theme: isTheme(record.theme) ? record.theme : base.theme,
    githubApi: typeof record.githubApi === 'boolean' ? record.githubApi : base.githubApi,
  };
}

export const settingsStore = createStore<Settings>(
  `${STORAGE_PREFIX}settings`,
  defaultSettings,
  sanitizeSettings,
);

export const useSettings = (): Settings => useStore(settingsStore);

export function updateSettings(patch: Partial<Settings>): void {
  settingsStore.set({ ...settingsStore.get(), ...patch });
}

/* ------------------------------------------------------------ recent searches */

export const recentStore = createStore<string[]>(
  `${STORAGE_PREFIX}recent`,
  () => [],
  (raw) =>
    Array.isArray(raw)
      ? raw.filter((item): item is string => typeof item === 'string').slice(0, MAX_RECENT_SEARCHES)
      : [],
);

export const useRecentSearches = (): string[] => useStore(recentStore);

export function addRecentSearch(query: string): void {
  const rest = recentStore.get().filter((item) => item.toLowerCase() !== query.toLowerCase());
  recentStore.set([query, ...rest].slice(0, MAX_RECENT_SEARCHES));
}

export function removeRecentSearch(query: string): void {
  recentStore.set(recentStore.get().filter((item) => item !== query));
}
