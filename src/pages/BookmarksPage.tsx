import { useMemo, useState } from 'react';
import { EmptyState } from '../components/EmptyState';
import { InboxIcon, SearchIcon } from '../components/Icons';
import { Link } from '../components/Link';
import { ResultCard } from '../components/ResultCard';
import { useI18n, type TKey } from '../i18n';
import { bookmarkToResult, useBookmarks } from '../lib/bookmarks';
import { viewHref } from '../lib/router';
import { isSourceId } from '../sources/types';

export function BookmarksPage() {
  const { t } = useI18n();
  const { bookmarks } = useBookmarks();
  const [filter, setFilter] = useState('');

  const shown = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return bookmarks;
    return bookmarks.filter((bookmark) => {
      const sourceName = isSourceId(bookmark.source) ? t(`source.${bookmark.source}` as TKey) : bookmark.source;
      return [bookmark.title, bookmark.description, bookmark.category, bookmark.aiTool, sourceName, bookmark.url]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [bookmarks, filter, t]);

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">{t('bookmarks.title')}</h1>
        {bookmarks.length > 0 && <p className="muted">{t('bookmarks.count', { n: bookmarks.length })}</p>}
      </div>

      {bookmarks.length === 0 ? (
        <EmptyState icon={<InboxIcon />} title={t('bookmarks.emptyTitle')} body={t('bookmarks.emptyBody')}>
          <Link href={viewHref('home')} className="button button-primary button-sm">
            {t('bookmarks.emptyAction')}
          </Link>
        </EmptyState>
      ) : (
        <>
          <div className="searchbar-field filter-field">
            <SearchIcon className="searchbar-icon" />
            <input
              type="search"
              className="searchbar-input"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder={t('bookmarks.searchPlaceholder')}
              aria-label={t('bookmarks.search')}
              dir="auto"
              autoComplete="off"
            />
          </div>

          {shown.length === 0 ? (
            <p className="muted" role="status">
              {t('bookmarks.noMatch', { q: filter.trim() })}
            </p>
          ) : (
            <ul className="result-list">
              {shown.map((bookmark) => (
                <li key={bookmark.id}>
                  <ResultCard result={bookmarkToResult(bookmark)} savedAt={bookmark.savedAt} />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
