export type Lang = 'en' | 'fa';

export const APP_VERSION = '1.1.0';

/** Programmable Search Engine ID. Public by design; empty when not configured. */
export const GOOGLE_CSE_ID: string = (import.meta.env.VITE_GOOGLE_CSE_ID ?? '').trim();

/** Placeholder shipped in .env.example — treated as "not configured". */
export const hasGoogleCse = (): boolean =>
  GOOGLE_CSE_ID.length > 0 && GOOGLE_CSE_ID !== 'your_programmable_search_engine_id';

export const MAX_QUERY_LENGTH = 80;
export const MIN_QUERY_LENGTH = 2;
export const PAGE_SIZE = 50;
export const MAX_RECENT_SEARCHES = 8;

export const STORAGE_PREFIX = 'vibeyaab:';

export const CHANNEL = {
  url: 'https://eitaa.com/AIDEEP',
  display: 'eitaa.com/AIDEEP',
  name: { en: 'AIDEEP', fa: 'لایه‌های عمیق هوش مصنوعی' } satisfies Record<Lang, string>,
};
