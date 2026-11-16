import { useI18n } from '../i18n';
import { updateSettings, useSettings, type Theme } from '../lib/storage';
import { Segmented } from './Segmented';

export function ThemeToggle() {
  const { t } = useI18n();
  const { theme } = useSettings();
  return (
    <Segmented<Theme>
      label={t('settings.theme')}
      value={theme}
      onChange={(next) => updateSettings({ theme: next })}
      options={[
        { value: 'system', label: t('theme.system') },
        { value: 'light', label: t('theme.light') },
        { value: 'dark', label: t('theme.dark') },
      ]}
    />
  );
}
