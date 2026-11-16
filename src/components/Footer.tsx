import { useI18n } from '../i18n';
import { CHANNEL } from '../lib/config';
import { viewHref } from '../lib/router';
import { ExternalLink, Link } from './Link';

export function Footer() {
  const { t, lang } = useI18n();
  return (
    <footer className="site-footer">
      <div className="container footer-inner">
        <p className="footer-line">
          {t('footer.follow')}:{' '}
          <ExternalLink href={CHANNEL.url} className="footer-link">
            {CHANNEL.name[lang]} · <span dir="ltr">{CHANNEL.display}</span>
          </ExternalLink>
        </p>
        <p className="footer-line footer-muted">
          <Link href={viewHref('about')} className="footer-link">
            {t('footer.about')}
          </Link>
          <span aria-hidden="true"> · </span>
          {t('footer.note')}
        </p>
      </div>
    </footer>
  );
}
