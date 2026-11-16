import { useI18n } from '../i18n';
import { useBookmarks } from '../lib/bookmarks';
import { useRoute, viewHref } from '../lib/router';
import { cx } from '../lib/utils';
import { BookmarkIcon, SettingsIcon } from './Icons';
import { LanguageToggle } from './LanguageToggle';
import { Link } from './Link';

export function Header() {
  const { t } = useI18n();
  const { view } = useRoute();
  const { bookmarks } = useBookmarks();

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href={viewHref('home')} className="wordmark" aria-label={`VibeYaab — ${t('nav.home')}`}>
          <span dir="ltr">
            Vibe<span className="wordmark-accent">Yaab</span>
          </span>
        </Link>
        <nav className="header-nav" aria-label={t('nav.main')}>
          <Link
            href={viewHref('bookmarks')}
            className={cx('icon-button', view === 'bookmarks' && 'is-active')}
            aria-label={t('nav.bookmarksCount', { n: bookmarks.length })}
            title={t('nav.bookmarks')}
            aria-current={view === 'bookmarks' ? 'page' : undefined}
          >
            <BookmarkIcon filled={bookmarks.length > 0} />
            {bookmarks.length > 0 && (
              <span className="count-badge" aria-hidden="true">
                {bookmarks.length > 99 ? '99+' : bookmarks.length}
              </span>
            )}
          </Link>
          <Link
            href={viewHref('settings')}
            className={cx('icon-button', view === 'settings' && 'is-active')}
            aria-label={t('nav.settings')}
            title={t('nav.settings')}
            aria-current={view === 'settings' ? 'page' : undefined}
          >
            <SettingsIcon />
          </Link>
          <LanguageToggle />
        </nav>
      </div>
    </header>
  );
}
