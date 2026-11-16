import { useI18n } from '../i18n';
import { CHANNEL } from '../lib/config';
import { SendIcon } from './Icons';
import { ExternalLink } from './Link';

/** Promotional card for the AIDEEP Eitaa channel. */
export function ChannelPromo() {
  const { t, lang } = useI18n();
  return (
    <aside className="promo" aria-label={t('about.channelTitle')}>
      <div className="promo-icon">
        <SendIcon />
      </div>
      <div className="promo-text">
        <p className="promo-title">{lang === 'fa' ? CHANNEL.name.fa : `${CHANNEL.name.en} · ${t('promo.title')}`}</p>
        <p className="promo-body">{t('promo.body')}</p>
      </div>
      <ExternalLink href={CHANNEL.url} className="button button-secondary button-sm">
        {t('promo.cta')}
        <span dir="ltr" className="promo-url">
          {CHANNEL.display}
        </span>
      </ExternalLink>
    </aside>
  );
}
