import { useEffect, useRef } from 'react';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { OfflineIcon } from './components/Icons';
import { Toaster } from './components/Toaster';
import { useI18n, type TKey } from './i18n';
import { useRoute, type View } from './lib/router';
import { useSettings } from './lib/storage';
import { useOnline } from './lib/useOnline';
import { AboutPage } from './pages/AboutPage';
import { BookmarksPage } from './pages/BookmarksPage';
import { HomePage } from './pages/HomePage';
import { ResultsPage } from './pages/ResultsPage';
import { SettingsPage } from './pages/SettingsPage';

const TITLE_KEYS: Record<View, TKey> = {
  home: 'title.home',
  results: 'title.results',
  bookmarks: 'title.bookmarks',
  settings: 'title.settings',
  about: 'title.about',
};

const THEME_COLORS = { light: '#ffffff', dark: '#0e1014' } as const;

/** Keeps <html lang>, <html dir>, the theme attribute and the browser theme colour in sync with settings. */
function useDocumentSettings() {
  const { lang, dir } = useI18n();
  const { theme } = useSettings();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', theme);

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyColor = () => {
      const dark = theme === 'dark' || (theme === 'system' && media.matches);
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', dark ? THEME_COLORS.dark : THEME_COLORS.light);
    };
    applyColor();
    media.addEventListener('change', applyColor);
    return () => media.removeEventListener('change', applyColor);
  }, [theme]);
}

export default function App() {
  const route = useRoute();
  const { t } = useI18n();
  const online = useOnline();
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useDocumentSettings();

  useEffect(() => {
    document.title = t(TITLE_KEYS[route.view], { q: route.q });
  }, [route.view, route.q, t]);

  // Move focus to the content and reset scroll when the view changes (not on first load).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [route.view]);

  let page;
  switch (route.view) {
    case 'results':
      page = <ResultsPage key="results" q={route.q} scope={route.scope} xe={route.xe} />;
      break;
    case 'bookmarks':
      page = <BookmarksPage />;
      break;
    case 'settings':
      page = <SettingsPage />;
      break;
    case 'about':
      page = <AboutPage />;
      break;
    default:
      page = <HomePage />;
  }

  return (
    <>
      <a className="skip-link" href="#main">
        {t('nav.skip')}
      </a>
      <Header />
      {!online && (
        <div className="offline-banner" role="status">
          <div className="container">
            <OfflineIcon />
            <span>{t('offline.banner')}</span>
          </div>
        </div>
      )}
      <main id="main" ref={mainRef} tabIndex={-1} className="container main">
        {page}
      </main>
      <Footer />
      <Toaster />
    </>
  );
}
