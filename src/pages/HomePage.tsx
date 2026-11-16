import { useState } from 'react';
import { BrowseLinks } from '../components/BrowseLinks';
import { ChannelPromo } from '../components/ChannelPromo';
import { ScopeChips } from '../components/FilterBar';
import { CloseIcon } from '../components/Icons';
import { SearchBar } from '../components/SearchBar';
import { useI18n } from '../i18n';
import { navigate, searchHref, type Scope } from '../lib/router';
import { addRecentSearch, recentStore, removeRecentSearch, useRecentSearches } from '../lib/storage';
import type { SearchOptions } from '../components/SearchBar';

export function HomePage() {
  const { t } = useI18n();
  const recent = useRecentSearches();
  const [scope, setScope] = useState<Scope>('all');

  const search = (q: string, options?: SearchOptions) => {
    addRecentSearch(q);
    navigate(searchHref(q, scope, options?.excludedExpansion ?? []));
  };

  return (
    <div className="page home">
      <section className="hero">
        <h1 className="hero-title">{t('app.tagline')}</h1>
        <p className="hero-lead">{t('app.description')}</p>
        <SearchBar onSearch={search} autoFocus={false} expansionPreview />
        <ScopeChips value={scope} onChange={setScope} />
        <p className="hint">{t('search.hint')}</p>

        {recent.length > 0 && (
          <div className="recent">
            <div className="recent-header">
              <h2 className="section-label">{t('search.recent')}</h2>
              <button type="button" className="link-button" onClick={() => recentStore.set([])}>
                {t('search.recentClear')}
              </button>
            </div>
            <ul className="recent-list">
              {recent.map((query) => (
                <li key={query} className="recent-chip">
                  <button
                    type="button"
                    className="recent-run"
                    dir="auto"
                    aria-label={t('search.recentRun', { q: query })}
                    onClick={() => search(query)}
                  >
                    {query}
                  </button>
                  <button
                    type="button"
                    className="recent-remove"
                    aria-label={t('search.recentRemove', { q: query })}
                    onClick={() => removeRecentSearch(query)}
                  >
                    <CloseIcon />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="panel">
        <h2 className="section-title">{t('home.howTitle')}</h2>
        <ol className="steps">
          <li>{t('home.how1')}</li>
          <li>{t('home.how2')}</li>
          <li>{t('home.how3')}</li>
        </ol>
      </section>

      <section className="panel">
        <h2 className="section-title">{t('home.browseTitle')}</h2>
        <p className="muted">{t('home.browseBody')}</p>
        <BrowseLinks />
      </section>

      <ChannelPromo />
    </div>
  );
}
