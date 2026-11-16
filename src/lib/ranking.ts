import type { SearchResult } from '../sources/types';
import { parseTime, tokenize } from './utils';

/**
 * Ranking is a plain weighted sum of explainable signals. Weights are listed here and
 * summarised to users in the "Why these results?" panel.
 */
export const WEIGHTS = {
  titlePhrase: 25,
  titleWords: 25,
  descriptionWords: 15,
  sourceOrder: 6,
  upvotes: 8,
  live: 5,
  openSource: 5,
  repository: 3,
  recency: 5,
  structured: 4,
} as const;

export type RankedResult = { result: SearchResult; score: number };

const DAY = 86_400_000;

function share(tokens: string[], haystack: string): number {
  if (!tokens.length) return 0;
  return tokens.filter((token) => haystack.includes(token)).length / tokens.length;
}

/**
 * Matches on cross-lingual expansion terms count slightly less than matches on
 * the user's own words, so Persian-language results for the original query keep
 * their edge while English results found via expansion still interleave sensibly.
 */
const EXPANSION_DISCOUNT = 0.85;

export function scoreResult(result: SearchResult, query: string, maxUpvotes: number, now: number): number {
  const phrase = query.trim().toLowerCase();
  const tokens = tokenize(query);
  const title = result.title.toLowerCase();
  const details = [result.description, result.category, result.aiTool].filter(Boolean).join(' ').toLowerCase();

  let score = 0;
  if (phrase && title.includes(phrase)) score += WEIGHTS.titlePhrase;
  score += share(tokens, title) * WEIGHTS.titleWords;
  score += share(tokens, details) * WEIGHTS.descriptionWords;

  if (result.position !== undefined) score += WEIGHTS.sourceOrder / (1 + result.position / 3);

  if (result.upvotes && maxUpvotes > 0) {
    score += (Math.log1p(result.upvotes) / Math.log1p(maxUpvotes)) * WEIGHTS.upvotes;
  }
  if (result.isLive === true) score += WEIGHTS.live;
  if (result.isOpenSource === true) score += WEIGHTS.openSource;
  if (result.repositoryUrl) score += WEIGHTS.repository;

  const stamp = parseTime(result.updatedAt ?? result.createdAt);
  if (stamp !== null) {
    const ageDays = Math.max(0, (now - stamp) / DAY);
    score += Math.max(0, 1 - ageDays / 730) * WEIGHTS.recency;
  }
  if (result.source === 'vibeking' || result.source === 'onesvibe') score += WEIGHTS.structured;
  else if (result.source === 'github') score += WEIGHTS.structured / 2;

  return score;
}

/**
 * Ranks the merged result set (original query + expansion terms) with the same
 * explainable signals as before. Each result gets the better of its score for
 * the user's query and its discounted score for any expansion term it matches.
 */
export function rankResults(
  results: SearchResult[],
  query: string,
  expansionTerms: readonly string[] = [],
): RankedResult[] {
  const now = Date.now();
  const maxUpvotes = results.reduce((max, item) => Math.max(max, item.upvotes ?? 0), 0);
  return results
    .map((result, index) => {
      let score = scoreResult(result, query, maxUpvotes, now);
      for (const term of expansionTerms) {
        const expandedScore = scoreResult(result, term, maxUpvotes, now) * EXPANSION_DISCOUNT;
        if (expandedScore > score) score = expandedScore;
      }
      return { result, score, index };
    })
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(({ result, score }) => ({ result, score }));
}
