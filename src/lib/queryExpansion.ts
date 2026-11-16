import { PERSIAN_ENGLISH_DICTIONARY } from '../data/persianEnglishDictionary';
import { isPredominantlyPersian, normalizePersianText } from './language';

/**
 * Cross-lingual query expansion: Persian query in → English search terms out.
 *
 * - 100 % local: a curated dictionary (`src/data/persianEnglishDictionary.ts`),
 *   no translation API, no network, no keys — safe to run on any input change.
 * - Only fires for predominantly Persian queries; English queries are returned
 *   untouched so searching "drawing" keeps working exactly as before.
 * - The original Persian query is never modified or discarded — the expansion
 *   terms are searched *in addition*, and the caller keeps searching `q` too.
 */

/** Upper bound of English terms per search, so one broad query can't fan out forever. */
export const MAX_EXPANSION_TERMS = 6;

/** Normalised dictionary key → English terms. Built once per page load. */
const LOOKUP: ReadonlyMap<string, readonly string[]> = new Map(
  Object.entries(PERSIAN_ENGLISH_DICTIONARY).map(([key, terms]) => [normalizePersianText(key), terms]),
);

export type QueryExpansion = {
  /** The query is predominantly Persian script. */
  isPersian: boolean;
  /** Dictionary entries that matched the query, as authored (for transparency). */
  matchedPersian: string[];
  /** English terms to search in addition to the original query (deduped, capped). */
  terms: string[];
};

const EMPTY: QueryExpansion = { isPersian: false, matchedPersian: [], terms: [] };

/** Space-padded haystack so keys only match on word boundaries. */
const padded = (normalized: string): string => ` ${normalized} `;

/**
 * Expands a predominantly Persian query with curated English equivalents.
 * Whole-word matching only: "کتاب" does not trigger inside "کتابخانه".
 * Deterministic and synchronous — the UI can call it per keystroke without
 * any network cost; the *search* itself only runs on submit.
 */
export function expandQuery(rawQuery: string): QueryExpansion {
  const query = rawQuery.trim();
  if (query.length < 2) return EMPTY;

  const isPersian = isPredominantlyPersian(query);
  if (!isPersian) return EMPTY;

  const haystack = padded(normalizePersianText(query));
  if (haystack.trim().length === 0) return EMPTY;

  const matchedPersian: string[] = [];
  const terms: string[] = [];
  const seen = new Set<string>();

  // Latin words the user already typed (e.g. "نقاشی drawing") must not be re-added.
  for (const word of query.toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
    if (word.length >= 2) seen.add(word);
  }

  for (const [normalizedKey, keyTerms] of LOOKUP) {
    if (!haystack.includes(padded(normalizedKey))) continue;
    matchedPersian.push(keyFor(normalizedKey) || normalizedKey);
    for (const term of keyTerms) {
      const lower = term.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      terms.push(term);
      if (terms.length >= MAX_EXPANSION_TERMS) return { isPersian, matchedPersian, terms };
    }
  }

  return { isPersian, matchedPersian, terms };
}

/** Reverse of `normalizePersianText` for the matched keys (normalised → authored). */
const AUTHORED_BY_NORMALIZED: ReadonlyMap<string, string> = new Map(
  Object.keys(PERSIAN_ENGLISH_DICTIONARY).map((key) => [normalizePersianText(key), key]),
);

const keyFor = (normalizedKey: string): string => AUTHORED_BY_NORMALIZED.get(normalizedKey) ?? '';

/** English terms that remain after the user removed some of them. */
export function withoutRemovedTerms(terms: readonly string[], removed: readonly string[]): string[] {
  const removedSet = new Set(removed.map((term) => term.toLowerCase()));
  return terms.filter((term) => !removedSet.has(term.toLowerCase()));
}
