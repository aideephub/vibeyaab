import { useCallback, useEffect, useMemo, useState } from 'react';
import { getEnabledSources, getSource } from '../sources';
import type { SearchResult } from '../sources/types';
import { PAGE_SIZE } from './config';
import { dedupe } from './dedupe';
import { expandQuery, withoutRemovedTerms, type QueryExpansion } from './queryExpansion';
import { rankResults, type RankedResult } from './ranking';
import { runSearch, toFailure, type SourceFailure, type SourceOutcome } from './search';
import { useSettings } from './storage';

type State = {
  /** Results for the user's original query — feeds VibeKing pagination. */
  bySource: Record<string, SearchResult[]>;
  /** Results for the English expansion terms, merged into the same list. */
  expandedBySource: Record<string, SearchResult[]>;
  failures: Record<string, SourceFailure>;
  expansionFailures: Record<string, SourceFailure>;
  pendingOriginal: string[];
  pendingExpanded: string[];
  /** True while an expansion round is part of the current search. */
  expansionActive: boolean;
  hasMore: boolean;
  loadingMore: boolean;
};

const EMPTY: State = {
  bySource: {},
  expandedBySource: {},
  failures: {},
  expansionFailures: {},
  pendingOriginal: [],
  pendingExpanded: [],
  expansionActive: false,
  hasMore: false,
  loadingMore: false,
};

export type SearchExpansion = {
  /** Expansion computed for the current query, before any removals. */
  info: QueryExpansion;
  /** Terms actually searched now (removals applied). */
  activeTerms: string[];
  /** How many expansion terms the user removed for this search. */
  removedCount: number;
};

/**
 * Runs one explicit search across all enabled sources and keeps per-source state so the
 * list can render partial results, partial failures and "load more" for VibeKing.
 *
 * Cross-lingual search: when the query is predominantly Persian, every source is queried
 * a second time with the English expansion terms joined into one query. Both rounds run
 * in parallel, their results are merged, and the global URL-based dedupe keeps one entry
 * per page. The original query is always searched first — expansion is purely additive.
 */
export function useSearch(q: string, removedTerms: readonly string[] = []) {
  const { githubApi } = useSettings();
  const [state, setState] = useState<State>(EMPTY);
  const [nonce, setNonce] = useState(0);

  const expansion = useMemo(() => expandQuery(q), [q]);

  const removedKey = useMemo(() => removedTerms.map((term) => term.toLowerCase()).join('\u0000'), [removedTerms]);

  const activeTerms = useMemo(() => {
    const removed = removedKey ? removedKey.split('\u0000') : [];
    return withoutRemovedTerms(expansion.terms, removed);
  }, [expansion.terms, removedKey]);

  const activeTermsKey = activeTerms.join('\u0000');

  useEffect(() => {
    const sources = getEnabledSources();
    const controller = new AbortController();
    const terms = activeTermsKey ? activeTermsKey.split('\u0000') : [];
    const expandedQuery = terms.join(' ');
    const runExpanded =
      terms.length > 0 && expandedQuery.toLowerCase() !== q.trim().toLowerCase();

    setState({
      ...EMPTY,
      pendingOriginal: sources.map((source) => source.id),
      pendingExpanded: runExpanded ? sources.map((source) => source.id) : [],
      expansionActive: runExpanded,
    });

    const onOutcome = (slot: 'original' | 'expanded') => (outcome: SourceOutcome) => {
      if (controller.signal.aborted) return;
      setState((prev) => {
        if (slot === 'original') {
          return {
            ...prev,
            pendingOriginal: prev.pendingOriginal.filter((id) => id !== outcome.id),
            bySource:
              'results' in outcome ? { ...prev.bySource, [outcome.id]: outcome.results } : prev.bySource,
            failures:
              'failure' in outcome ? { ...prev.failures, [outcome.id]: outcome.failure } : prev.failures,
            hasMore:
              outcome.id === 'vibeking' && 'results' in outcome
                ? outcome.results.length >= PAGE_SIZE
                : prev.hasMore,
          };
        }
        return {
          ...prev,
          pendingExpanded: prev.pendingExpanded.filter((id) => id !== outcome.id),
          expandedBySource:
            'results' in outcome
              ? { ...prev.expandedBySource, [outcome.id]: outcome.results }
              : prev.expandedBySource,
          expansionFailures:
            'failure' in outcome
              ? { ...prev.expansionFailures, [outcome.id]: outcome.failure }
              : prev.expansionFailures,
        };
      });
    };

    void runSearch(
      sources,
      { q, limit: PAGE_SIZE, offset: 0, sort: 'top', signal: controller.signal },
      onOutcome('original'),
    );
    if (runExpanded) {
      void runSearch(
        sources,
        { q: expandedQuery, limit: PAGE_SIZE, offset: 0, sort: 'top', signal: controller.signal },
        onOutcome('expanded'),
      );
    }

    return () => controller.abort();
  }, [q, activeTermsKey, nonce, githubApi]);

  const loadMore = useCallback(() => {
    const source = getSource('vibeking');
    if (!source || state.loadingMore) return;
    const offset = (state.bySource.vibeking ?? []).length;
    setState((prev) => ({ ...prev, loadingMore: true }));
    source.search({ q, limit: PAGE_SIZE, offset, sort: 'top' }).then(
      (results) =>
        setState((prev) => ({
          ...prev,
          loadingMore: false,
          hasMore: results.length >= PAGE_SIZE,
          bySource: { ...prev.bySource, vibeking: [...(prev.bySource.vibeking ?? []), ...results] },
        })),
      (error: unknown) =>
        setState((prev) => ({
          ...prev,
          loadingMore: false,
          failures: { ...prev.failures, vibeking: toFailure(error) },
        })),
    );
  }, [q, state.bySource, state.loadingMore]);

  const reload = useCallback(() => setNonce((value) => value + 1), []);

  /** A source is reported as failed only when every round it took part in failed. */
  const failures = useMemo(() => {
    const combined: Record<string, SourceFailure> = {};
    for (const [id, failure] of Object.entries(state.failures)) {
      if (!state.expansionActive || state.expansionFailures[id]) combined[id] = failure;
    }
    return combined;
  }, [state.failures, state.expansionFailures, state.expansionActive]);

  const items = useMemo<SearchResult[]>(
    () =>
      dedupe([...Object.values(state.bySource).flat(), ...Object.values(state.expandedBySource).flat()]),
    [state.bySource, state.expandedBySource],
  );
  const ranked = useMemo<RankedResult[]>(
    () => rankResults(items, q, activeTerms),
    [items, q, activeTerms],
  );

  const succeededCount = useMemo(
    () => new Set([...Object.keys(state.bySource), ...Object.keys(state.expandedBySource)]).size,
    [state.bySource, state.expandedBySource],
  );

  const expansionInfo: SearchExpansion = {
    info: expansion,
    activeTerms,
    removedCount: expansion.terms.length - activeTerms.length,
  };

  return {
    items,
    ranked,
    failures,
    expansion: expansionInfo,
    loading: state.pendingOriginal.length + state.pendingExpanded.length > 0,
    hasMore: state.hasMore,
    loadingMore: state.loadingMore,
    succeededCount,
    loadMore,
    reload,
  };
}
