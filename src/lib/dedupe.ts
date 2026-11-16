import type { SearchResult, SourceId } from '../sources/types';
import { normalizeUrl } from './utils';

/** Lower number = richer, more trustworthy structured data; wins when URLs collide. */
const PRIORITY: Record<SourceId, number> = {
  vibeking: 0,
  onesvibe: 0,
  github: 1,
  youraiproject: 2,
  opensaas: 2,
  awesome: 2,
  google: 3,
  other: 4,
};

const MERGEABLE = [
  'category',
  'aiTool',
  'isLive',
  'isOpenSource',
  'repositoryUrl',
  'createdAt',
  'updatedAt',
  'upvotes',
  'sourceUrl',
] as const;

/**
 * Removes duplicates by normalized URL. The result from the richest source is kept and
 * any facts it lacks are filled in from the duplicates (never invented).
 */
export function dedupe(results: SearchResult[]): SearchResult[] {
  const groups = new Map<string, SearchResult[]>();
  for (const result of results) {
    const key = normalizeUrl(result.url);
    const group = groups.get(key);
    if (group) group.push(result);
    else groups.set(key, [result]);
  }

  return [...groups.values()].map((group) => {
    if (group.length === 1) return group[0];
    const sorted = [...group].sort((a, b) => PRIORITY[a.source] - PRIORITY[b.source]);
    const merged: SearchResult = { ...sorted[0] };
    for (const other of sorted.slice(1)) {
      for (const key of MERGEABLE) {
        if (merged[key] === undefined || merged[key] === null) {
          (merged as Record<string, unknown>)[key] = other[key];
        }
      }
      if (!merged.description && other.description) merged.description = other.description;
    }
    return merged;
  });
}
