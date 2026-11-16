import type { ReactNode } from 'react';
import { useI18n } from '../i18n';
import { cx } from '../lib/utils';
import { AlertIcon, OfflineIcon } from './Icons';

/** `banner` is a non-blocking warning above partial results; `full` replaces the list. */
export function ErrorState({
  variant,
  title,
  body,
  onRetry,
  offline = false,
  children,
}: {
  variant: 'banner' | 'full';
  title: string;
  body: string;
  onRetry?: () => void;
  offline?: boolean;
  children?: ReactNode;
}) {
  const { t } = useI18n();
  const icon = offline ? <OfflineIcon /> : <AlertIcon />;
  const retry = onRetry && (
    <button type="button" className="button button-secondary button-sm" onClick={onRetry}>
      {t('results.retry')}
    </button>
  );

  if (variant === 'banner') {
    return (
      <div className="notice notice-warning" role="status">
        <span className="notice-icon">{icon}</span>
        <div className="notice-text">
          <strong>{title}</strong> <span>{body}</span>
        </div>
        {retry}
      </div>
    );
  }

  return (
    <div className={cx('state', 'state-error')} role="alert">
      <div className="state-icon">{icon}</div>
      <h2 className="state-title">{title}</h2>
      <p className="state-body">{body}</p>
      <div className="state-actions">
        {retry}
        {children}
      </div>
    </div>
  );
}
