import { useI18n, type TKey } from '../i18n';
import { InfoIcon } from './Icons';

const SIGNALS: TKey[] = [
  'why.titleMatch',
  'why.descMatch',
  'why.order',
  'why.upvotes',
  'why.live',
  'why.oss',
  'why.recent',
  'why.structured',
];

/** Expandable, plain-language explanation of the ranking signals. */
export function WhyPanel() {
  const { t } = useI18n();
  return (
    <details className="why">
      <summary>
        <InfoIcon />
        {t('why.title')}
      </summary>
      <div className="why-body">
        <p>{t('why.intro')}</p>
        <ol>
          {SIGNALS.map((key) => (
            <li key={key}>{t(key)}</li>
          ))}
        </ol>
        <p>{t('why.dedupe')}</p>
      </div>
    </details>
  );
}
