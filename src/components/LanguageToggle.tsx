import { useI18n } from '../i18n';
import { updateSettings } from '../lib/storage';
import type { Lang } from '../lib/config';
import { Segmented } from './Segmented';

/** `compact` is the header button; `segmented` is the Settings control. */
export function LanguageToggle({ variant = 'compact' }: { variant?: 'compact' | 'segmented' }) {
  const { lang, t } = useI18n();

  if (variant === 'segmented') {
    return (
      <Segmented<Lang>
        label={t('settings.language')}
        value={lang}
        onChange={(next) => updateSettings({ lang: next })}
        options={[
          { value: 'en', label: t('lang.english'), lang: 'en' },
          { value: 'fa', label: t('lang.persian'), lang: 'fa' },
        ]}
      />
    );
  }

  const next: Lang = lang === 'en' ? 'fa' : 'en';
  return (
    <button
      type="button"
      className="icon-button lang-button"
      onClick={() => updateSettings({ lang: next })}
      aria-label={t('lang.toggle')}
      title={t('lang.toggle')}
      lang={next}
    >
      {t('lang.toggleShort')}
    </button>
  );
}
