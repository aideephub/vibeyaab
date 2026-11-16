import { useI18n, type TKey } from '../i18n';
import type { SourceId } from '../sources/types';

export function SourceBadge({
  source,
  rawLabel,
  via,
}: {
  source: SourceId;
  /** Free-text label, used only for imported bookmarks from unknown sources. */
  rawLabel?: string;
  via?: 'google';
}) {
  const { t } = useI18n();
  const label =
    source === 'other' && rawLabel && rawLabel !== 'other' ? rawLabel : t(`source.${source}` as TKey);
  return (
    <span className="source-badge" data-source={source}>
      <span className="source-dot" aria-hidden="true" />
      <span>{label}</span>
      {via === 'google' && source !== 'google' && <span className="source-via">· {t('source.via')}</span>}
    </span>
  );
}
