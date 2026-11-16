import { useRef, useState, type ChangeEvent } from 'react';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { DownloadIcon, TrashIcon, UploadIcon } from '../components/Icons';
import { LanguageToggle } from '../components/LanguageToggle';
import { ThemeToggle } from '../components/ThemeToggle';
import { useI18n } from '../i18n';
import {
  bookmarksStore,
  buildExport,
  clearAllLocalData,
  mergeBookmarks,
  parseImport,
  useBookmarks,
  type ParsedImport,
} from '../lib/bookmarks';
import { APP_VERSION } from '../lib/config';
import { updateSettings, useSettings } from '../lib/storage';
import { pushToast } from '../lib/toast';

type Pending = { parsed: ParsedImport; fresh: number; dupes: number };

export function SettingsPage() {
  const { t } = useI18n();
  const settings = useSettings();
  const { bookmarks } = useBookmarks();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [applySettings, setApplySettings] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  const exportData = () => {
    const blob = new Blob([buildExport()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vibeyaab-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    pushToast(t('settings.exportDone'), 'success');
  };

  const chooseFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPending(null);
    setImportError(null);

    let text: string;
    try {
      text = await file.text();
    } catch {
      setImportError(t('import.readError'));
      return;
    }
    try {
      const parsed = parseImport(text);
      const known = new Set(bookmarks.map((bookmark) => bookmark.id));
      const fresh = parsed.bookmarks.filter((bookmark) => !known.has(bookmark.id)).length;
      setApplySettings(false);
      setPending({ parsed, fresh, dupes: parsed.bookmarks.length - fresh });
    } catch {
      setImportError(t('import.invalid'));
      pushToast(t('import.invalid'), 'error');
    }
  };

  const confirmImport = () => {
    if (!pending) return;
    const { merged, added, skipped } = mergeBookmarks(bookmarksStore.get(), pending.parsed.bookmarks);
    bookmarksStore.set(merged);
    if (applySettings && pending.parsed.settings) updateSettings(pending.parsed.settings);
    setPending(null);
    pushToast(t('import.success', { added, skipped }), 'success');
  };

  const clearAll = () => {
    clearAllLocalData();
    setConfirmClear(false);
    setPending(null);
    pushToast(t('settings.clearDone'), 'success');
  };

  return (
    <div className="page">
      <div className="page-head">
        <h1 className="page-title">{t('settings.title')}</h1>
      </div>

      <section className="panel">
        <h2 className="section-title">{t('settings.language')}</h2>
        <LanguageToggle variant="segmented" />
      </section>

      <section className="panel">
        <h2 className="section-title">{t('settings.theme')}</h2>
        <ThemeToggle />
      </section>

      <section className="panel">
        <h2 className="section-title">{t('settings.githubTitle')}</h2>
        <label className="switch">
          <input
            type="checkbox"
            checked={settings.githubApi}
            onChange={(event) => updateSettings({ githubApi: event.target.checked })}
          />
          <span className="switch-track" aria-hidden="true" />
          <span>{t('settings.githubLabel')}</span>
        </label>
        <p className="muted small">{t('settings.githubHelp')}</p>
      </section>

      <section className="panel">
        <h2 className="section-title">{t('settings.data')}</h2>

        <div className="setting-row">
          <div>
            <h3 className="setting-name">{t('settings.export')}</h3>
            <p className="muted small">{t('settings.exportHelp')}</p>
          </div>
          <button type="button" className="button button-secondary button-sm" onClick={exportData}>
            <DownloadIcon />
            {t('settings.export')}
          </button>
        </div>

        <div className="setting-row">
          <div>
            <h3 className="setting-name">{t('settings.import')}</h3>
            <p className="muted small">{t('settings.importHelp')}</p>
          </div>
          <button
            type="button"
            className="button button-secondary button-sm"
            onClick={() => fileRef.current?.click()}
          >
            <UploadIcon />
            {t('settings.importChoose')}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-label={t('settings.import')}
            onChange={chooseFile}
          />
        </div>

        {importError && (
          <p className="notice notice-error" role="alert">
            {importError}
          </p>
        )}

        {pending && (
          <div className="notice notice-info import-box" role="group" aria-label={t('import.summaryTitle')}>
            <strong>{t('import.summaryTitle')}</strong>
            <p>
              {t('import.summary', {
                total: pending.parsed.bookmarks.length,
                fresh: pending.fresh,
                dupes: pending.dupes,
              })}
            </p>
            {pending.parsed.settings && Object.keys(pending.parsed.settings).length > 0 && (
              <label className="check">
                <input
                  type="checkbox"
                  checked={applySettings}
                  onChange={(event) => setApplySettings(event.target.checked)}
                />
                <span>{t('import.hasSettings')}</span>
              </label>
            )}
            <p className="muted small">{t('import.note')}</p>
            <div className="row-actions">
              <button type="button" className="button button-primary button-sm" onClick={confirmImport}>
                {t('import.merge')}
              </button>
              <button type="button" className="button button-secondary button-sm" onClick={() => setPending(null)}>
                {t('import.cancel')}
              </button>
            </div>
          </div>
        )}

        <div className="setting-row">
          <div>
            <h3 className="setting-name">{t('settings.clear')}</h3>
            <p className="muted small">{t('settings.clearHelp')}</p>
          </div>
          <button type="button" className="button button-danger-outline button-sm" onClick={() => setConfirmClear(true)}>
            <TrashIcon />
            {t('settings.clear')}
          </button>
        </div>
      </section>

      <section className="panel">
        <h2 className="section-title">{t('settings.about')}</h2>
        <p className="muted">{t('settings.privacy')}</p>
        <p className="muted small">
          VibeYaab · {t('settings.version', { v: APP_VERSION })}
        </p>
      </section>

      <ConfirmDialog
        open={confirmClear}
        title={t('settings.clearConfirmTitle')}
        body={t('settings.clearConfirmBody')}
        confirmLabel={t('settings.clearConfirm')}
        cancelLabel={t('settings.clearCancel')}
        onConfirm={clearAll}
        onCancel={() => setConfirmClear(false)}
      />
    </div>
  );
}
