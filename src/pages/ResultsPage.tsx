import { useEffect, useMemo, useState } from 'react';
import { BrowseLinks } from '../components/BrowseLinks';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { ExpansionChips } from '../components/ExpansionChips';
import { FilterBar } from '../components/FilterBar';
import { InboxIcon, SearchIcon } from '../components/Icons';
import { Link } from '../components/Link';
import { ResultList, ResultSkeletons } from '../components/ResultList';
import { SearchBar } from '../components/SearchBar';
import { WhyPanel } from '../components/WhyPanel';
import { useI18n, type TKey } from '../i18n';
import { bookmarkIdFor, useBookmarks } from '../lib/bookmarks';
import { navigate, searchHref, viewHref, type Scope } from '../lib/router';
import { applyFilters, computeFacets, DEFAULT_FILTERS, type Filters } from '../lib/search';
import { addRecentSearch } from '../lib/storage';
import { useOnline } from '../lib/useOnline';
import { useSearch } from '../lib/useSearch';
import { getSource } from '../sources';

type LocalFilters = Omit<Filters, 'scope'>;

export function ResultsPage({ q, scope, xe }: { q: string; scope: Scope; xe: string[] }) {
  const { t, lang } = useI18n();
  const online = useOnline();
  const { ids } = useBookmarks();
  const search = useSearch(q, xe);
  const [local, setLocal] = useState<LocalFilters>(DEFAULT_FILTERS);

  useEffect(() => setLocal(DEFAULT_FILTERS), [q]);

  const facets = useMemo(() => computeFacets(search.items), [search.items]);
  const visible = useMemo(
    () =>
      applyFilters(search.ranked, { ...local, scope }, (url) => ids.has(bookmarkIdFor(url))),
    [search.ranked, local, scope, ids],
  );

  const hasActive =
    scope !== 'all' ||
    local.source !== 'all' ||
    local.category !== '' ||
    local.aiTool !== '' ||
    local.sort !== 'relevance';

  const clearFilters = () => {
    setLocal(DEFAULT_FILTERS);
    if (scope !== 'all') navigate(searchHref(q, 'all'), { replace: true });
  };

  const submit = (next: string) => {
    addRecentSearch(next);
    navigate(searchHref(next, scope));
  };

  /** Removing an expansion term re-runs the search without it (URL `xe` param). */
  const removeExpansionTerm = (term: string) => {
    navigate(searchHref(q, scope, [...xe, term]), { replace: true });
  };

  const restoreExpansionTerms = () => {
    navigate(searchHref(q, scope), { replace: true });
  };

  const failed = Object.entries(search.failures).map(([id, failure]) => {
    const label = getSource(id)?.label[lang] ?? id;
    return `${label} (${t(`failure.${failure.kind}` as TKey)})`;
  });

  const allFailed = !search.loading && search.succeededCount === 0;
  const count = visible.length;

  let body;
  if (allFailed) {
    body = (
      <ErrorState
        variant="full"
        offline={!online}
        title={t(online ? 'results.errorTitle' : 'results.offlineTitle')}
        body={t(online ? 'results.errorBody' : 'results.offlineBody')}
        onRetry={search.reload}
      >
        <Link href={viewHref('bookmarks')} className="button button-secondary button-sm">
          {t('nav.bookmarks')}
        </Link>
      </ErrorState>
    );
  } else if (search.loading && search.items.length === 0) {
    body = <ResultSkeletons />;
  } else if (search.items.length === 0) {
    body = (
      <>
        <EmptyState icon={<InboxIcon />} title={t('results.emptyTitle')} body={t('results.emptyBody')} />
        <section className="panel">
          <h2 className="section-title">{t('browse.moreTitle')}</h2>
          <p className="muted">{t('browse.moreBody')}</p>
          <BrowseLinks query={q} />
        </section>
      </>
    );
  } else if (count === 0) {
    body = (
      <EmptyState
        icon={<SearchIcon />}
        title={t('results.emptyFilteredTitle')}
        body={t('results.emptyFilteredBody')}
      >
        <button type="button" className="button button-secondary button-sm" onClick={clearFilters}>
          {t('results.clearFilters')}
        </button>
      </EmptyState>
    );
  } else {
    body = (
      <>
        <ResultList items={visible} />
        {search.hasMore && (
          <div className="load-more">
            <button
              type="button"
              className="button button-secondary"
              onClick={search.loadMore}
              disabled={search.loadingMore}
            >
              {t(search.loadingMore ? 'results.loadingMore' : 'results.loadMore')}
            </button>
            <p className="muted small">{t('results.updatedLoaded')}</p>
          </div>
        )}
        <section className="panel">
          <h2 className="section-title">{t('browse.moreTitle')}</h2>
          <p className="muted">{t('browse.moreBody')}</p>
          <BrowseLinks query={q} />
        </section>
      </>
    );
  }

  return (
    <div className="page results">
      <SearchBar initialValue={q} onSearch={submit} />

      {search.expansion.info.terms.length > 0 && (
        <ExpansionChips
          terms={search.expansion.activeTerms}
          title={t('results.expansionTitle')}
          help={t('results.expansionHelp')}
          removedCount={search.expansion.removedCount}
          onRemove={removeExpansionTerm}
          onRestore={restoreExpansionTerms}
        />
      )}

      {search.items.length > 0 && (
        <FilterBar
          scope={scope}
          onScope={(next) => navigate(searchHref(q, next), { replace: true })}
          filters={local}
          onFilters={setLocal}
          facets={facets}
          onClear={clearFilters}
          hasActive={hasActive}
        />
      )}

      <div className="results-head">
        <h2 className="results-title" dir="auto">
          {t('results.heading', { q })}
        </h2>
        <p className="results-count" role="status" aria-live="polite">
          {search.loading
            ? t('results.searching')
            : search.items.length > 0
              ? count === 1
                ? t('results.countOne')
                : t('results.count', { n: count })
              : ''}
        </p>
      </div>

      {failed.length > 0 && !allFailed && (
        <ErrorState
          variant="banner"
          title={t('results.partialTitle')}
          body={t('results.partialBody', { sources: failed.join(', ') })}
          onRetry={search.reload}
        />
      )}

      {body}

      {search.items.length > 0 && <WhyPanel />}
    </div>
  );
}
