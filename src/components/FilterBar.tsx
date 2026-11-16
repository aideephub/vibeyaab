import { useI18n, type TKey } from '../i18n';
import { SCOPES, type Scope } from '../lib/router';
import type { Facets, Filters, SortKey } from '../lib/search';
import { cx } from '../lib/utils';
import type { SourceId } from '../sources/types';

/** Quick filters: horizontally scrollable chips on mobile, wrapping row on desktop. */
export function ScopeChips({ value, onChange }: { value: Scope; onChange: (scope: Scope) => void }) {
  const { t } = useI18n();
  return (
    <div className="chips-scroll" role="group" aria-label={t('scope.label')}>
      {SCOPES.map((scope) => (
        <button
          key={scope}
          type="button"
          className={cx('chip', value === scope && 'is-selected')}
          aria-pressed={value === scope}
          onClick={() => onChange(scope)}
        >
          {t(`scope.${scope}` as TKey)}
        </button>
      ))}
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="select-field">
      <span className="select-label">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {children}
      </select>
    </label>
  );
}

export function FilterBar({
  scope,
  onScope,
  filters,
  onFilters,
  facets,
  onClear,
  hasActive,
}: {
  scope: Scope;
  onScope: (scope: Scope) => void;
  filters: Omit<Filters, 'scope'>;
  onFilters: (next: Omit<Filters, 'scope'>) => void;
  facets: Facets;
  onClear: () => void;
  hasActive: boolean;
}) {
  const { t } = useI18n();
  const showSource = facets.sources.length > 1;

  return (
    <section className="filter-bar" aria-label={t('results.filters')}>
      <ScopeChips value={scope} onChange={onScope} />
      <div className="filter-selects">
        {showSource && (
          <Select
            label={t('filter.source')}
            value={filters.source}
            onChange={(value) => onFilters({ ...filters, source: value as SourceId | 'all' })}
          >
            <option value="all">{t('filter.allSources')}</option>
            {facets.sources.map((source) => (
              <option key={source} value={source}>
                {t(`source.${source}` as TKey)}
              </option>
            ))}
          </Select>
        )}
        {facets.categories.length > 0 && (
          <Select
            label={t('filter.category')}
            value={filters.category}
            onChange={(value) => onFilters({ ...filters, category: value })}
          >
            <option value="">{t('filter.any')}</option>
            {facets.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        )}
        {facets.aiTools.length > 0 && (
          <Select
            label={t('filter.aiTool')}
            value={filters.aiTool}
            onChange={(value) => onFilters({ ...filters, aiTool: value })}
          >
            <option value="">{t('filter.any')}</option>
            {facets.aiTools.map((tool) => (
              <option key={tool} value={tool}>
                {tool}
              </option>
            ))}
          </Select>
        )}
        <Select
          label={t('filter.sort')}
          value={filters.sort}
          onChange={(value) => onFilters({ ...filters, sort: value as SortKey })}
        >
          <option value="relevance">{t('sort.relevance')}</option>
          {facets.canSortNewest && <option value="newest">{t('sort.newest')}</option>}
          {facets.canSortUpvoted && <option value="upvoted">{t('sort.upvoted')}</option>}
        </Select>
        {hasActive && (
          <button type="button" className="link-button" onClick={onClear}>
            {t('results.clearFilters')}
          </button>
        )}
      </div>
    </section>
  );
}
