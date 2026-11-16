import { useI18n } from '../i18n';
import type { RankedResult } from '../lib/ranking';
import { ResultCard } from './ResultCard';

export function ResultList({ items }: { items: RankedResult[] }) {
  return (
    <ul className="result-list">
      {items.map(({ result }) => (
        <li key={result.id}>
          <ResultCard result={result} />
        </li>
      ))}
    </ul>
  );
}

export function ResultSkeletons() {
  const { t } = useI18n();
  return (
    <div className="result-list" role="status" aria-label={t('results.skeleton')}>
      {[0, 1, 2].map((key) => (
        <div key={key} className="card skeleton" aria-hidden="true">
          <span className="skeleton-line skeleton-short" />
          <span className="skeleton-line skeleton-title" />
          <span className="skeleton-line" />
          <span className="skeleton-line skeleton-medium" />
        </div>
      ))}
    </div>
  );
}
