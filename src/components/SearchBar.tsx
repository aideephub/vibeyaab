import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { ExpansionChips } from './ExpansionChips';
import { useI18n } from '../i18n';
import { MAX_QUERY_LENGTH, MIN_QUERY_LENGTH } from '../lib/config';
import { expandQuery } from '../lib/queryExpansion';
import { SearchIcon } from './Icons';

export type SearchOptions = {
  /** Expansion terms to leave out of this search (`xe=` URL parameter). */
  excludedExpansion?: string[];
};

export function SearchBar({
  initialValue = '',
  onSearch,
  autoFocus = false,
  expansionPreview = false,
}: {
  initialValue?: string;
  onSearch: (query: string, options?: SearchOptions) => void;
  autoFocus?: boolean;
  /** Show removable English expansion terms while typing, before the search runs. */
  expansionPreview?: boolean;
}) {
  const { t } = useI18n();
  const [value, setValue] = useState(initialValue);
  const [invalid, setInvalid] = useState(false);
  const [excluded, setExcluded] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorId = useId();

  useEffect(() => setValue(initialValue), [initialValue]);

  // Local dictionary lookup only — no network call on keystrokes.
  const preview = useMemo(() => (expansionPreview ? expandQuery(value) : null), [expansionPreview, value]);
  const previewKey = preview?.terms.join('\u0000') ?? '';
  const visibleTerms = useMemo(
    () => (preview?.terms ?? []).filter((term) => !excluded.includes(term)),
    [preview, excluded],
  );

  // Removing a term only applies to the current query's terms; reset when they change.
  useEffect(() => setExcluded([]), [previewKey]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const query = value.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      setInvalid(true);
      inputRef.current?.focus();
      return;
    }
    setInvalid(false);
    inputRef.current?.blur();
    onSearch(query, excluded.length > 0 ? { excludedExpansion: excluded } : undefined);
  };

  return (
    <form className="searchbar" role="search" onSubmit={submit} noValidate>
      <div className="searchbar-row">
        <div className="searchbar-field">
          <SearchIcon className="searchbar-icon" />
          <input
            ref={inputRef}
            type="search"
            className="searchbar-input"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (invalid) setInvalid(false);
            }}
            placeholder={t('search.placeholder')}
            aria-label={t('search.label')}
            aria-invalid={invalid}
            aria-describedby={invalid ? errorId : undefined}
            maxLength={MAX_QUERY_LENGTH}
            dir="auto"
            enterKeyHint="search"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus={autoFocus}
          />
        </div>
        <button type="submit" className="button button-primary searchbar-submit">
          {t('search.submit')}
        </button>
      </div>
      <p id={errorId} className="field-error" role="alert" hidden={!invalid}>
        {invalid ? t('search.tooShort', { n: MIN_QUERY_LENGTH }) : null}
      </p>
      {preview && preview.terms.length > 0 && (
        <ExpansionChips
          terms={visibleTerms}
          title={t('search.expansionPreview')}
          help={t('search.expansionPreviewHelp')}
          removedCount={preview.terms.length - visibleTerms.length}
          onRemove={(term) => setExcluded((previous) => [...previous, term])}
          onRestore={() => setExcluded([])}
        />
      )}
    </form>
  );
}
