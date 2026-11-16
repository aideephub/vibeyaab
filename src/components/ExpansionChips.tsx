import { useI18n } from '../i18n';
import { CloseIcon } from './Icons';

/**
 * Removable chips for the English expansion terms of a Persian query, with a
 * plain-language explanation. Used in two places:
 * - under the search bar *before* submitting (preview of what will be searched)
 * - on the results page *after* searching
 * Removal state and handlers belong to the caller (URL `xe` param or local
 * preview state); this component is purely presentational and accessible.
 */
export function ExpansionChips({
  terms,
  title,
  help,
  removedCount = 0,
  onRemove,
  onRestore,
}: {
  terms: readonly string[];
  title: string;
  help: string;
  removedCount?: number;
  onRemove?: (term: string) => void;
  onRestore?: () => void;
}) {
  const { t } = useI18n();
  if (terms.length === 0 && removedCount === 0) return null;

  return (
    <aside className="expansion" role="region" aria-label={t('results.expansionRegion')}>
      <div className="expansion-row">
        <span className="expansion-title">{title}</span>
        {terms.length > 0 && (
          <ul className="expansion-terms">
            {terms.map((term) => (
              <li key={term} className="expansion-term">
                <span className="expansion-term-name" dir="ltr">
                  {term}
                </span>
                {onRemove && (
                  <button
                    type="button"
                    className="expansion-term-remove"
                    aria-label={t('results.expansionRemove', { term })}
                    onClick={() => onRemove(term)}
                  >
                    <CloseIcon />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
        {onRestore && removedCount > 0 && (
          <button type="button" className="link-button" onClick={onRestore}>
            {t('results.expansionRestore')}
          </button>
        )}
      </div>
      <p className="expansion-help">{help}</p>
    </aside>
  );
}
