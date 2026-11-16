import { dismissToast, useToasts } from '../lib/toast';
import { cx } from '../lib/utils';

/** Polite live region; the container is always mounted so announcements are reliable. */
export function Toaster() {
  const toasts = useToasts();
  return (
    <div className="toaster" role="status" aria-live="polite">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          type="button"
          className={cx('toast', `toast-${toast.tone}`)}
          onClick={() => dismissToast(toast.id)}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
}
