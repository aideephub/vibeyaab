import { useMemo } from 'react';
import type { Lang } from '../lib/config';
import { useSettings } from '../lib/storage';
import en, { type Dictionary } from './en';
import fa from './fa';

export type { Lang };
export type TKey = keyof Dictionary;
export type TParams = Record<string, string | number>;

const dictionaries: Record<Lang, Dictionary> = { en, fa };

/** `-u-nu-latn` keeps Latin digits in Persian output for consistency. */
const LOCALES: Record<Lang, string> = { en: 'en', fa: 'fa-u-nu-latn' };

export const dirOf = (lang: Lang): 'ltr' | 'rtl' => (lang === 'fa' ? 'rtl' : 'ltr');

function interpolate(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

const UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 86_400],
  ['month', 30 * 86_400],
  ['week', 7 * 86_400],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
];

/** Language, direction, translator and locale-aware formatters; re-renders instantly on change. */
export function useI18n() {
  const { lang } = useSettings();

  return useMemo(() => {
    const dict = dictionaries[lang];
    const locale = LOCALES[lang];
    const relative = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
    const number = new Intl.NumberFormat(locale);

    const t = (key: TKey, params?: TParams): string => interpolate(dict[key], params);

    /** Relative time from an ISO string; returns `null` for missing or invalid dates. */
    const formatRelative = (iso: string | null | undefined): string | null => {
      if (!iso) return null;
      const time = Date.parse(iso);
      if (Number.isNaN(time)) return null;
      const seconds = Math.max(0, Math.round((Date.now() - time) / 1000));
      for (const [unit, size] of UNITS) {
        if (seconds >= size) return relative.format(-Math.floor(seconds / size), unit);
      }
      return t('time.justNow');
    };

    return { lang, dir: dirOf(lang), t, formatRelative, formatNumber: (n: number) => number.format(n) };
  }, [lang]);
}
